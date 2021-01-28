import { Injectable } from '@angular/core';
import { CubismModelComponent, CubismModel } from './model';
import { Event, EventHub, Entity, Component, SystemBase } from '../ecs';
import { Shortcuts, SHORTCUT_HOLD, SHORTCUT_RELEASE } from '../input/shortcut';
import { CubismMotionComponent, CubismAnimator } from './animation/animator';

export const HostModelComponent = Component.register<number>();

// 这玩意儿似乎没有必要，因为在addEntity时就知道hostentity
@Injectable()
export class HostModel {
  model?: CubismModel;
  motionAnimator?: CubismAnimator;
  expressionAnimator?: CubismAnimator;
}

@Injectable()
export class HostModelSystem extends SystemBase {
  constructor(
    private event: EventHub,
    private shortcut: Shortcuts,
    private host: HostModel
  ) {
    super([CubismModelComponent, HostModelComponent]);

    shortcut.registerShortcut('ctrl+x', 'testanimation');
  }

  k: any;

  enter(entity: Entity): void {
    const model = CubismModelComponent.oneFrom(entity).data;
    // const
  }

  exit(): void {
    this.host.model = null;
  }

  update(entity: Entity, delta: number, time: number): void {
    // if key down and it
    for (const ev of this.event.consumeEvents('testanimation')) {
      if (ev.type == SHORTCUT_HOLD) {
        // this.k = this.host.motionQueue.startMotion({
        //     fadeInTime: 500,
        //     fadeOutTime: 500,
        //     duration: 5000
        // });
        const animator = CubismMotionComponent.oneFrom(entity).data;
        this.k = animator.start(animator.clips[0]);
        console.log('motion start');
      } else if (ev.type == SHORTCUT_RELEASE) {
        // this.host.motionQueue.stopMotion(this.k);
        // console.log('motion stop');
        const animator = CubismMotionComponent.oneFrom(entity).data;
        animator.fadeout(this.k);
      }
    }
  }
}
