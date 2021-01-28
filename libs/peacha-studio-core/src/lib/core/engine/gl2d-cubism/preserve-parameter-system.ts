import { Injectable } from '@angular/core';
import { CubismModelComponent } from './model';
import { Entity, Component, SystemBase } from '../ecs';

type PreserveParameterData = {
    savedParameter: number[];
};

export const PreserveParameterComponent = Component.register<PreserveParameterData>();

@Injectable()
export class PreserveParameterLoadSystem extends SystemBase {

    constructor() {
        super([
            CubismModelComponent,
            PreserveParameterComponent
        ]);
    }

    update(entity: Entity): void {
        const model = CubismModelComponent.oneFrom(entity).data;
        const preserve = PreserveParameterComponent.oneFrom(entity).data;
        if (preserve.savedParameter == undefined) {
            return;
        }
        for (let i = 0; i < preserve.savedParameter.length; i++) {
            model.native.parameters[i] = preserve[i];
        }
    }
}

@Injectable()
export class PreserveParameterSaveSystem extends SystemBase {
    constructor() {
        super([
            CubismModelComponent,
            PreserveParameterComponent
        ]);
    }

    update(entity: Entity): void {
        const model = CubismModelComponent.oneFrom(entity).data;
        const preserve = PreserveParameterComponent.oneFrom(entity).data;

        preserve.savedParameter = new Array(model.native.parameters.count);
        for (let i = 0; i < model.native.parameters.count; i++) {
            preserve.savedParameter[i] = model.parameterValues[i];
        }
    }
}
