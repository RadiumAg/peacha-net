import { Injectable } from '@angular/core';
import { SystemBase } from '../../ecs/system';
import { CubismExpressionComponent } from './animator';
import { Entity } from '../../ecs';
import { CubismModelComponent } from '../model';
import { CubismAnimationAction } from '.';
import { getEasingSine } from './utils';

@Injectable()
export class CubismExpressionSystem extends SystemBase {
    constructor() {
        super([CubismExpressionComponent]);
    }

    update(entity: Entity, delta: number, time: number): void {
        const queue = CubismExpressionComponent.oneFrom(entity).data;
        const model = CubismModelComponent.oneFrom(entity).data;
        queue.animationWillFadeout.forEach((v) => {
            v.fadeOutStartTime = time;
        });
        queue.animationWillFadeout.clear();
        if (queue.animationScheduled.size > 0) {
            const entry = queue.animationScheduled.values().next().value as CubismAnimationAction;
            entry.startTime = time;
            queue.animationScheduled.clear();
            queue.animationEntries.add(entry);
        }
        queue.animationEntries.forEach(entry => {
            const timeFromStart = (time - entry.startTime);
            const fadeIn = getEasingSine(timeFromStart / entry.fadeInTime);
            let fadeWeight = 1 * fadeIn;
            if (entry.fadeOutStartTime){
                const timeFromFadeout = time - entry.fadeOutStartTime;
                const fadeOut = getEasingSine((entry.fadeOutTime - timeFromFadeout) / entry.fadeOutTime);
                if (fadeOut <= 1 && fadeOut > 0) {
                    // console.log('fade out ' + fadeOut);
                } else if (fadeOut == 0) {
                    // motion stoped!
                    queue.terminate(entry);
                }
                fadeWeight *= fadeOut;
            }
            // set stateweight
            entry.clip.evaluate(timeFromStart / 1000, model, fadeWeight);
        });
    }
}
