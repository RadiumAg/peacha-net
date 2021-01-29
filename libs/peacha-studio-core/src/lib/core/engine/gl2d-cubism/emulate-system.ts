import { Injectable } from '@angular/core';
import { SystemBase, Entity } from '../ecs';
import { CubismModelComponent } from './model';

@Injectable()
export class CubismModelEmulateSystem extends SystemBase {
	constructor() {
		super([CubismModelComponent]);
	}

	update(entity: Entity): void {
		const model = CubismModelComponent.oneFrom(entity).data;
		model.native.update();
		model.native.drawables.resetDynamicFlags();
	}
}
