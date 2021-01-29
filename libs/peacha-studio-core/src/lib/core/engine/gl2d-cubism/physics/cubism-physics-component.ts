import { Component } from '../../ecs';
import { CubismPhysicsRig } from './cubism-phyisics-defs';
import { Vector2, vec2 } from '../../gl2d';

export class CubismPhysics {
	options: Options;
	physicsRig: CubismPhysicsRig;

	constructor() {
		this.options = new Options();
		this.physicsRig = new CubismPhysicsRig();
	}
}

export class Options {
	constructor() {
		this.gravity = vec2(0, 0);
		this.wind = vec2(0, 0);
	}

	gravity: Vector2;
	wind: Vector2;
}

export const CubismPhysicsComponent = Component.register<CubismPhysics>();
