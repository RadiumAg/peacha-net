import { CubismModel } from '../model';
import { CubismPhysics, CubismPhysicsComponent } from '../physics/cubism-physics-component';
import { vec2, Vector2, vec2sub, vec2mulByScalar } from '../../gl2d';
import { CubismPhysicsSubRig, CubismPhysicsInput, CubismPhysicsParticle, CubismPhysicsOutput, CubismPhysicsNormalization, CubismPhysicsSource, CubismPhysicsTargetType } from '../physics/cubism-phyisics-defs';
import { CubismMath } from '../cubism-math';
import { CubismPhysicsJson } from './structures';
import { Component } from '../../ecs/component';

/// physics types tags.
const PhysicsTypeTagX = 'X';
const PhysicsTypeTagY = 'Y';
const PhysicsTypeTagAngle = 'Angle';

export function loadPhysicsComponent(model: CubismModel, def: CubismPhysicsJson): Component<CubismPhysics> {
    const physics = new CubismPhysics();
    physics.physicsRig.gravity = vec2(def.Meta.EffectiveForces.Gravity.X, def.Meta.EffectiveForces.Gravity.Y);
    physics.physicsRig.wind = vec2(def.Meta.EffectiveForces.Wind.X, def.Meta.EffectiveForces.Wind.Y);
    physics.physicsRig.subRigCount = def.Meta.PhysicsSettingCount;

    physics.physicsRig.settings = new Array(physics.physicsRig.subRigCount).fill(null).map(x => new CubismPhysicsSubRig());
    physics.physicsRig.inputs = new Array(def.Meta.TotalInputCount).fill(null).map(x => new CubismPhysicsInput());
    physics.physicsRig.outputs = new Array(def.Meta.TotalOutputCount).fill(null).map(x => new CubismPhysicsOutput());
    physics.physicsRig.particles = new Array(def.Meta.VertexCount).fill(null).map(x => new CubismPhysicsParticle());

    let inputIndex = 0, outputIndex = 0, particleIndex = 0;

    for (let i = 0; i < physics.physicsRig.settings.length; ++i) {
        physics.physicsRig.settings[i].normalizationPosition.minimum = def.PhysicsSettings[i].Normalization.Position.Minimum;
        physics.physicsRig.settings[i].normalizationPosition.maximum = def.PhysicsSettings[i].Normalization.Position.Maximum;
        physics.physicsRig.settings[i].normalizationPosition.defalut = def.PhysicsSettings[i].Normalization.Position.Default;

        physics.physicsRig.settings[i].normalizationAngle.minimum = def.PhysicsSettings[i].Normalization.Angle.Minimum;
        physics.physicsRig.settings[i].normalizationAngle.maximum = def.PhysicsSettings[i].Normalization.Angle.Maximum;
        physics.physicsRig.settings[i].normalizationAngle.defalut = def.PhysicsSettings[i].Normalization.Angle.Default;

        // Input
        physics.physicsRig.settings[i].inputCount = def.PhysicsSettings[i].Input.length;
        physics.physicsRig.settings[i].baseInputIndex = inputIndex;

        for (let j = 0; j < physics.physicsRig.settings[i].inputCount; ++j) {
            physics.physicsRig.inputs[inputIndex + j].sourceParameterIndex = -1;
            physics.physicsRig.inputs[inputIndex + j].weight = def.PhysicsSettings[i].Input[j].Weight;
            physics.physicsRig.inputs[inputIndex + j].reflect = def.PhysicsSettings[i].Input[j].Reflect;

            if (def.PhysicsSettings[i].Input[j].Type == PhysicsTypeTagX) {
                physics.physicsRig.inputs[inputIndex + j].type = CubismPhysicsSource.CubismPhysicsSource_X;
                physics.physicsRig.inputs[inputIndex + j].getNormalizedParameterValue = getInputTranslationXFromNormalizedParameterValue;
            }
            else if (def.PhysicsSettings[i].Input[j].Type == PhysicsTypeTagY) {
                physics.physicsRig.inputs[inputIndex + j].type = CubismPhysicsSource.CubismPhysicsSource_Y;
                physics.physicsRig.inputs[inputIndex + j].getNormalizedParameterValue = getInputTranslationYFromNormalizedParamterValue;
            }
            else if (def.PhysicsSettings[i].Input[j].Type == PhysicsTypeTagAngle) {
                physics.physicsRig.inputs[inputIndex + j].type = CubismPhysicsSource.CubismPhysicsSource_Angle;
                physics.physicsRig.inputs[inputIndex + j].getNormalizedParameterValue = getInputAngleFromNormalizedParameterValue;
            }

            physics.physicsRig.inputs[inputIndex + j].source.targetType = CubismPhysicsTargetType.CubismPhysicsTargetType_Parameter;
            physics.physicsRig.inputs[inputIndex + j].source.id = def.PhysicsSettings[i].Input[j].Source.Id;
        }
        inputIndex += physics.physicsRig.settings[i].inputCount;

        // Output
        physics.physicsRig.settings[i].outputCount = def.PhysicsSettings[i].Output.length;
        physics.physicsRig.settings[i].baseOutputIndex = outputIndex;

        for (let j = 0; j < physics.physicsRig.settings[i].outputCount; ++j) {
            physics.physicsRig.outputs[outputIndex + j].destinationParameterIndex = -1;
            physics.physicsRig.outputs[outputIndex + j].vertexIndex = def.PhysicsSettings[i].Output[j].VertexIndex;
            physics.physicsRig.outputs[outputIndex + j].angleScale = def.PhysicsSettings[i].Output[j].Scale;
            physics.physicsRig.outputs[outputIndex + j].weight = def.PhysicsSettings[i].Output[j].Weight;
            physics.physicsRig.outputs[outputIndex + j].destination.targetType = CubismPhysicsTargetType.CubismPhysicsTargetType_Parameter;

            physics.physicsRig.outputs[outputIndex + j].destination.id = def.PhysicsSettings[i].Output[j].Destination.Id;

            if (def.PhysicsSettings[i].Output[j].Type == PhysicsTypeTagX) {
                physics.physicsRig.outputs[outputIndex + j].type = CubismPhysicsSource.CubismPhysicsSource_X;
                physics.physicsRig.outputs[outputIndex + j].getValue = getOutputTranslationX;
                physics.physicsRig.outputs[outputIndex + j].getScale = getOutputScaleTranslationX;
            }
            else if (def.PhysicsSettings[i].Output[j].Type == PhysicsTypeTagY) {
                physics.physicsRig.outputs[outputIndex + j].type = CubismPhysicsSource.CubismPhysicsSource_Y;
                physics.physicsRig.outputs[outputIndex + j].getValue = getOutputTranslationY;
                physics.physicsRig.outputs[outputIndex + j].getScale = getOutputScaleTranslationY;
            }
            else if (def.PhysicsSettings[i].Output[j].Type == PhysicsTypeTagAngle) {
                physics.physicsRig.outputs[outputIndex + j].type = CubismPhysicsSource.CubismPhysicsSource_Angle;
                physics.physicsRig.outputs[outputIndex + j].getValue = getOutputAngle;
                physics.physicsRig.outputs[outputIndex + j].getScale = getOutputScaleAngle;
            }

            physics.physicsRig.outputs[outputIndex + j].reflect = def.PhysicsSettings[i].Output[j].Reflect;
        }
        outputIndex += physics.physicsRig.settings[i].outputCount;

        // Particle
        physics.physicsRig.settings[i].particleCount = def.PhysicsSettings[i].Vertices.length;
        physics.physicsRig.settings[i].baseParticleIndex = particleIndex;

        for (let j = 0; j < physics.physicsRig.settings[i].particleCount; ++j) {
            physics.physicsRig.particles[particleIndex + j].mobility = def.PhysicsSettings[i].Vertices[j].Mobility;
            physics.physicsRig.particles[particleIndex + j].delay = def.PhysicsSettings[i].Vertices[j].Delay;
            physics.physicsRig.particles[particleIndex + j].acceleration = def.PhysicsSettings[i].Vertices[j].Acceleration;
            physics.physicsRig.particles[particleIndex + j].radius = def.PhysicsSettings[i].Vertices[j].Radius;
            physics.physicsRig.particles[particleIndex + j].position = vec2(
                def.PhysicsSettings[i].Vertices[j].Position.X,
                def.PhysicsSettings[i].Vertices[j].Position.Y
            );
        }

        particleIndex += physics.physicsRig.settings[i].particleCount;
    }
    let strand: CubismPhysicsParticle[];
    let currentSetting: CubismPhysicsSubRig;
    let radius: Vector2;

    for (let settingIndex = 0; settingIndex < physics.physicsRig.subRigCount; ++settingIndex) {
        currentSetting = physics.physicsRig.settings[settingIndex];
        strand = physics.physicsRig.particles.slice(currentSetting.baseParticleIndex);

        // Initialize the top of particle.
        strand[0].initialPosition = vec2(0.0, 0.0);
        strand[0].lastPosition = vec2(strand[0].initialPosition.x, strand[0].initialPosition.y);
        strand[0].lastGravity = vec2(0.0, -1.0);
        strand[0].lastGravity.y *= -1.0;
        strand[0].velocity = vec2(0.0, 0.0);
        strand[0].force = vec2(0.0, 0.0);

        // Initialize paritcles.
        for (let i = 1; i < currentSetting.particleCount; ++i) {
            radius = vec2(0.0, 0.0);
            radius.y = strand[i].radius;
            strand[i].initialPosition = vec2(strand[i - 1].initialPosition.x + radius.x, strand[i - 1].initialPosition.y + radius.y);
            strand[i].position = vec2(strand[i].initialPosition.x, strand[i].initialPosition.y);
            strand[i].lastPosition = vec2(strand[i].initialPosition.x, strand[i].initialPosition.y);
            strand[i].lastGravity = vec2(0.0, -1.0);
            strand[i].lastGravity.y *= -1.0;
            strand[i].velocity = vec2(0.0, 0.0);
            strand[i].force = vec2(0.0, 0.0);
        }
    }
    return new CubismPhysicsComponent(physics);
}


function getInputTranslationXFromNormalizedParameterValue(
    targetTranslation: Vector2,
    targetAngle: { angle: number },
    value: number,
    parameterMinimumValue: number,
    parameterMaximumValue: number,
    parameterDefaultValue: number,
    normalizationPosition: CubismPhysicsNormalization,
    normalizationAngle: CubismPhysicsNormalization,
    isInverted: boolean,
    weight: number): void {
    targetTranslation.x += normalizeParameterValue(
        value,
        parameterMinimumValue,
        parameterMaximumValue,
        parameterDefaultValue,
        normalizationPosition.minimum,
        normalizationPosition.maximum,
        normalizationPosition.defalut,
        isInverted
    ) * weight;
}

function getInputTranslationYFromNormalizedParamterValue(
    targetTranslation: Vector2,
    targetAngle: { angle: number },
    value: number,
    parameterMinimumValue: number,
    parameterMaximumValue: number,
    parameterDefaultValue: number,
    normalizationPosition: CubismPhysicsNormalization,
    normalizationAngle: CubismPhysicsNormalization,
    isInverted: boolean,
    weight: number): void {
    targetTranslation.y += normalizeParameterValue(
        value,
        parameterMinimumValue,
        parameterMaximumValue,
        parameterDefaultValue,
        normalizationPosition.minimum,
        normalizationPosition.maximum,
        normalizationPosition.defalut,
        isInverted
    ) * weight;
}

function getInputAngleFromNormalizedParameterValue(
    targetTranslation: Vector2,
    targetAngle: { angle: number },
    value: number,
    parameterMinimumValue: number,
    parameterMaximumValue: number,
    parameterDefaultValue: number,
    normalizaitionPosition: CubismPhysicsNormalization,
    normalizationAngle: CubismPhysicsNormalization,
    isInverted: boolean,
    weight: number): void {
    targetAngle.angle += normalizeParameterValue(
        value,
        parameterMinimumValue,
        parameterMaximumValue,
        parameterDefaultValue,
        normalizationAngle.minimum,
        normalizationAngle.maximum,
        normalizationAngle.defalut,
        isInverted,
    ) * weight;
}

function getOutputTranslationX(
    translation: Vector2,
    particles: CubismPhysicsParticle[],
    particleIndex: number,
    isInverted: boolean,
    parentGravity: Vector2): number {
    let outputValue: number = translation.x;

    if (isInverted) {
        outputValue *= -1.0;
    }

    return outputValue;
}

function getOutputTranslationY(
    translation: Vector2,
    particles: CubismPhysicsParticle[],
    particleIndex: number,
    isInverted: boolean,
    parentGravity: Vector2): number {
    let outputValue: number = translation.y;

    if (isInverted) {
        outputValue *= -1.0;
    }
    return outputValue;
}

function getOutputAngle(
    translation: Vector2,
    particles: CubismPhysicsParticle[],
    particleIndex: number,
    isInverted: boolean,
    parentGravity: Vector2): number {
    let outputValue: number;

    if (particleIndex >= 2) {
        parentGravity = vec2sub(particles[particleIndex - 1].position, particles[particleIndex - 2].position);
    }
    else {
        parentGravity = vec2mulByScalar(parentGravity, -1);
    }

    outputValue = CubismMath.directionToRadian(parentGravity, translation);

    if (isInverted) {
        outputValue *= -1.0;
    }

    return outputValue;
}


function getOutputScaleTranslationX(translationScale: Vector2, angleScale: number): number {
    return translationScale.x;
}

function getOutputScaleTranslationY(translationScale: Vector2, angleScale: number): number {
    return translationScale.y;
}

function getOutputScaleAngle(translationScale: Vector2, angleScale: number): number {
    return angleScale;
}


function normalizeParameterValue(
    value: number,
    parameterMinimum: number,
    parameterMaximum: number,
    parameterDefault: number,
    normalizedMinimum: number,
    normalizedMaximum: number,
    normalizedDefault: number,
    isInverted: boolean): number {
    let result = 0.0;

    const maxValue: number = Math.max(parameterMaximum, parameterMinimum);

    if (maxValue < value) {
        value = maxValue;
    }

    const minValue: number = Math.min(parameterMaximum, parameterMinimum);

    if (minValue > value) {
        value = minValue;
    }

    const minNormValue: number = Math.min(normalizedMinimum, normalizedMaximum);
    const maxNormValue: number = Math.max(normalizedMinimum, normalizedMaximum);
    const middleNormValue: number = normalizedDefault;

    const middleValue: number = getDefaultValue(minValue, maxValue);
    const paramValue: number = value - middleValue;

    switch (sign(paramValue)) {
        case 1:
            {
                const nLength: number = maxNormValue - middleNormValue;
                const pLength: number = maxValue - middleValue;

                if (pLength != 0.0) {
                    result = paramValue * (nLength / pLength);
                    result += middleNormValue;
                }

                break;
            }
        case -1:
            {
                const nLength: number = minNormValue - middleNormValue;
                const pLength: number = minValue - middleValue;

                if (pLength != 0.0) {
                    result = paramValue * (nLength / pLength);
                    result += middleNormValue;
                }

                break;
            }
        case 0:
            {
                result = middleNormValue;

                break;
            }
        default:
            {
                break;
            }
    }

    return (isInverted)
        ? result
        : (result * -1.0);
}


/**
 * Gets sign.
 *
 * @param value Evaluation target value.
 *
 * @return Sign of value.
 */
function sign(value: number): number {
    let ret = 0;

    if (value > 0.0) {
        ret = 1;
    }
    else if (value < 0.0) {
        ret = -1;
    }

    return ret;
}



function getRangeValue(min: number, max: number): number {
    const maxValue: number = Math.max(min, max);
    const minValue: number = Math.min(min, max);

    return Math.abs(maxValue - minValue);
}

function getDefaultValue(min: number, max: number): number {
    const minValue: number = Math.min(min, max);
    return minValue + (getRangeValue(min, max) / 2.0);
}
