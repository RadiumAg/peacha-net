import { SystemBase, Entity } from '../../ecs';
import { Injectable } from '@angular/core';
import { CubismPhysicsComponent } from './cubism-physics-component';
import { CubismModelComponent } from '../model';
import { Vector2, vec2, vec2normalize, vec2mulByScalar, vec2add, vec2sub } from '../../gl2d';
import { CubismPhysicsSubRig, CubismPhysicsInput, CubismPhysicsOutput, CubismPhysicsParticle, CubismPhysicsNormalization } from './cubism-phyisics-defs';
import { CubismMath } from '../cubism-math';


/// Constant of air resistance.
const AirResistance = 5.0;

/// Constant of maximum weight of input and output ratio.
const MaximumWeight = 100.0;

/// Constant of threshold of movement.
const MovementThreshold = 0.001;

@Injectable()
export class CubismPhysicsSystem extends SystemBase {
  constructor() {
    super([
      CubismModelComponent,
      CubismPhysicsComponent
    ]);
  }

  update(entity: Entity, delta: number, time: number): void {
    const model = CubismModelComponent.oneFrom(entity).data;
    const physics = CubismPhysicsComponent.oneFrom(entity).data;

    physics.options.gravity.y = -1;

    // console.log(physics.options);
    let totalAngle: { angle: number };
    let weight: number;
    let radAngle: number;
    let outputValue: number;
    const totalTranslation: Vector2 = vec2(0, 0);
    let currentSetting: CubismPhysicsSubRig;
    let currentInput: CubismPhysicsInput[];
    let currentOutput: CubismPhysicsOutput[];
    let currentParticles: CubismPhysicsParticle[];

    let parameterValue: Float32Array;
    let parameterMaximumValue: Float32Array;
    let parameterMinimumValue: Float32Array;
    let parameterDefaultValue: Float32Array;

    parameterValue = model.native.parameters.values;
    parameterMaximumValue = model.native.parameters.maximumValues;
    parameterMinimumValue = model.native.parameters.minimumValues;
    parameterDefaultValue = model.native.parameters.defaultValues;

    for (let settingIndex = 0; settingIndex < physics.physicsRig.subRigCount; ++settingIndex) {
      totalAngle = { angle: 0.0 };
      totalTranslation.x = 0.0;
      totalTranslation.y = 0.0;
      currentSetting = physics.physicsRig.settings[settingIndex];
      currentInput = physics.physicsRig.inputs.slice(currentSetting.baseInputIndex);
      currentOutput = physics.physicsRig.outputs.slice(currentSetting.baseOutputIndex);
      currentParticles = physics.physicsRig.particles.slice(currentSetting.baseParticleIndex);

      // Load input parameters
      for (let i = 0; i < currentSetting.inputCount; ++i) {
        weight = currentInput[i].weight / MaximumWeight;

        if (currentInput[i].sourceParameterIndex == -1) {
          currentInput[i].sourceParameterIndex = model.getParameterIndex(currentInput[i].source.id);
        }

        currentInput[i].getNormalizedParameterValue(
          totalTranslation,
          totalAngle,
          parameterValue[currentInput[i].sourceParameterIndex],
          parameterMinimumValue[currentInput[i].sourceParameterIndex],
          parameterMaximumValue[currentInput[i].sourceParameterIndex],
          parameterDefaultValue[currentInput[i].sourceParameterIndex],
          currentSetting.normalizationPosition,
          currentSetting.normalizationAngle,
          currentInput[0].reflect,
          weight
        );
      }

      radAngle = CubismMath.degreesToRadian(-totalAngle.angle);

      totalTranslation.x = (totalTranslation.x * Math.cos(radAngle) - totalTranslation.y * Math.sin(radAngle));
      totalTranslation.y = (totalTranslation.x * Math.sin(radAngle) + totalTranslation.y * Math.cos(radAngle));

      // Calculate particles position.
      updateParticles(
        currentParticles,
        currentSetting.particleCount,
        totalTranslation,
        totalAngle.angle,
        physics.options.wind,
        MovementThreshold * currentSetting.normalizationPosition.maximum,
        delta / 1000,
        AirResistance
      );

      // Update output parameters.
      for (let i = 0; i < currentSetting.outputCount; ++i) {
        const particleIndex = currentOutput[i].vertexIndex;

        if (particleIndex < 1 || particleIndex >= currentSetting.particleCount) {
          break;
        }

        if (currentOutput[i].destinationParameterIndex == -1) {
          currentOutput[i].destinationParameterIndex = model.getParameterIndex(currentOutput[i].destination.id);
        }

        const translation: Vector2 = vec2(
          currentParticles[particleIndex].position.x - currentParticles[particleIndex - 1].position.x,
          currentParticles[particleIndex].position.y - currentParticles[particleIndex - 1].position.y);

        outputValue = currentOutput[i].getValue(
          translation,
          currentParticles,
          particleIndex,
          currentOutput[i].reflect,
          physics.options.gravity
        );

        const destinationParameterIndex: number = currentOutput[i].destinationParameterIndex;
        const outParameterValue: Float32Array = (!Float32Array.prototype.slice && 'subarray' in Float32Array.prototype)
          ? parameterValue.slice(destinationParameterIndex) // 値渡しするため、JSON.parse, JSON.stringify
          : parameterValue.slice(destinationParameterIndex);
        // TODO: 非常没意义的代码

        updateOutputParameterValue(
          outParameterValue,
          parameterMinimumValue[destinationParameterIndex],
          parameterMaximumValue[destinationParameterIndex],
          outputValue,
          currentOutput[i]
        );

        // 値を反映
        for (let offset: number = destinationParameterIndex, outParamIndex = 0; offset < parameterValue.length; offset++, outParamIndex++) {
          // parameterValue[offset] = outParameterValue[outParamIndex];
          model.setParameterByIndex(offset, outParameterValue[outParamIndex]);
        }
      }
    }
  }
}

/**
 * Updates particles.
 *
 * @param strand                Target array of particle.
 * @param strandCount           Count of particle.
 * @param totalTranslation      Total translation value.
 * @param totalAngle            Total angle.
 * @param windDirection         Direction of Wind.
 * @param thresholdValue        Threshold of movement.
 * @param deltaTimeSeconds      Delta time.
 * @param airResistance         Air resistance.
 */
function updateParticles(
  strand: CubismPhysicsParticle[],
  strandCount: number,
  totalTranslation: Vector2,
  totalAngle: number,
  windDirection: Vector2,
  thresholdValue: number,
  deltaTimeSeconds: number,
  airResistance: number): void {
  let totalRadian: number;
  let delay: number;
  let radian: number;
  let currentGravity: Vector2;
  let direction: Vector2 = vec2(0.0, 0.0);
  let velocity: Vector2 = vec2(0.0, 0.0);
  let force: Vector2 = vec2(0.0, 0.0);
  let newDirection: Vector2 = vec2(0.0, 0.0);

  strand[0].position = vec2(totalTranslation.x, totalTranslation.y);

  totalRadian = CubismMath.degreesToRadian(totalAngle);
  currentGravity = CubismMath.radianToDirection(totalRadian);
  currentGravity = vec2normalize(currentGravity);

  for (let i = 1; i < strandCount; ++i) {
    strand[i].force = vec2add(
      vec2mulByScalar(currentGravity, strand[i].acceleration),
      windDirection);

    strand[i].lastPosition = vec2(strand[i].position.x, strand[i].position.y);

    delay = strand[i].delay * deltaTimeSeconds * 30.0;

    direction = vec2sub(strand[i].position, strand[i - 1].position);

    radian = CubismMath.directionToRadian(strand[i].lastGravity, currentGravity) / airResistance;

    direction.x = ((Math.cos(radian) * direction.x) - (direction.y * Math.sin(radian)));
    direction.y = ((Math.sin(radian) * direction.x) + (direction.y * Math.cos(radian)));

    strand[i].position = vec2add(strand[i - 1].position, direction);

    velocity = vec2mulByScalar(strand[i].velocity, delay);
    force = vec2mulByScalar(vec2mulByScalar(strand[i].force, delay), delay);

    strand[i].position = vec2add(vec2add(strand[i].position, velocity), (force));

    newDirection = vec2sub(strand[i].position, (strand[i - 1].position));
    newDirection = vec2normalize(newDirection);

    strand[i].position = vec2add(strand[i - 1].position, vec2mulByScalar(newDirection, strand[i].radius));

    if (Math.abs(strand[i].position.x) < thresholdValue) {
      strand[i].position.x = 0.0;
    }

    if (delay != 0.0) {
      strand[i].velocity = vec2sub(strand[i].position, strand[i].lastPosition);
      strand[i].velocity = vec2mulByScalar(strand[i].velocity, 1 / delay);
      strand[i].velocity = vec2mulByScalar(strand[i].velocity, strand[i].mobility);
    }

    strand[i].force = vec2(0.0, 0.0);
    strand[i].lastGravity = vec2(currentGravity.x, currentGravity.y);
  }

}

/**
 * Updates output parameter value.
 * @param parameterValue            Target parameter value.
 * @param parameterValueMinimum     Minimum of parameter value.
 * @param parameterValueMaximum     Maximum of parameter value.
 * @param translation               Translation value.
 */
function updateOutputParameterValue(
  parameterValue: Float32Array,
  parameterValueMinimum: number,
  parameterValueMaximum: number,
  translation: number,
  output: CubismPhysicsOutput): void {
  let outputScale: number;
  let value: number;
  let weight: number;

  outputScale = output.getScale(output.translationScale, output.angleScale);

  value = translation * outputScale;

  if (value < parameterValueMinimum) {
    if (value < output.valueBelowMinimum) {
      output.valueBelowMinimum = value;
    }

    value = parameterValueMinimum;
  }
  else if (value > parameterValueMaximum) {
    if (value > output.valueExceededMaximum) {
      output.valueExceededMaximum = value;
    }

    value = parameterValueMaximum;
  }

  weight = (output.weight / MaximumWeight);

  if (weight >= 1.0) {
    parameterValue[0] = value;
  }
  else {
    value = (parameterValue[0] * (1.0 - weight)) + (value * weight);
    parameterValue[0] = value;
  }
}
