import { Injectable } from '@angular/core';
import { SystemBase, Entity } from '../../ecs';
import { CubismMotionComponent } from './animator';
import { CubismModelComponent } from '../model';
import { CubismEmptyIdleClip } from './animation-clip';

@Injectable()
export class CubismAnimationSystem extends SystemBase {
  private breathAnimation = new CubismEmptyIdleClip();
  constructor() {
    super([CubismMotionComponent]);
  }

  update(entity: Entity, delta: number, time: number): void {
    const queue = CubismMotionComponent.oneFrom(entity).data;
    const model = CubismModelComponent.oneFrom(entity).data;

    queue.animationEntries.forEach((v) => {
      // if it has ended.
      if (time > v.endTime) {
        queue.terminate(v);
      }
    });
    queue.animationWillFadeout.forEach((v) => {
      // if it keeps playing and is not yet to end (not fadeouting)
      if (v.fadeOutStartTime < 0 || time < v.fadeOutStartTime) {
        // 在此fadeout理论上是不可逆转的了
        v.fadeOutStartTime = time;
      }
    });
    queue.animationWillFadeout.clear();

    if (queue.animationScheduled.size > 0) {
      // NB: 只允许一个动作的时候要把之前播放的动作暂停   暂停锤子 直接取消
      queue.animationEntries.forEach((v) => {
        if (time < v.fadeOutStartTime && !v.clip.idle) {
          // 在此fadeout理论上是不可逆转的了
          queue.terminate(v);
        }
      });
      // 如果只允许一个动作时只处理最后一个，但表情可以存在多个的话就可以同时存在：注意已有的播放问题，不要对同一个clip多次播放？！
      Array.from(queue.animationScheduled.values()).forEach(
        (entry, index) => {
          if (
            index === queue.animationScheduled.size - 1 ||
            entry.clip.idle
          ) {
            entry.startTime = time;
            entry.endTime =
              entry.clip.duration > 0
                ? time + entry.clip.duration
                : Number.MAX_VALUE;
            entry.fadeOutStartTime =
              entry.clip.duration > 0
                ? time + entry.clip.duration - entry.fadeOutTime
                : Number.MAX_VALUE;
            queue.animationEntries.add(entry);
          }
        }
      );
      queue.animationScheduled.clear();
    }

    if (!queue.playingClips.has(this.breathAnimation)) {
      queue.start(this.breathAnimation);
    }

    queue.clips.forEach((clip) => {
      if (clip.idle && !queue.playingClips.has(clip)) {
        queue.start(clip);
      }
    });

    // motion update start
    queue.animationEntries.forEach((entry) => {
      const timeFromStart = time - entry.startTime;
      entry.clip.evaluate(timeFromStart / 1000, model, 1);


      // if (entry.clip.idle) {
      //     entry.clip.evaluate(timeFromStart / 1000, model, 1);
      // } else {
      //     const fadeIn = getEasingSine(timeFromStart / entry.fadeInTime);
      //     if (fadeIn < 1) {
      //         // console.log('fade in ' + fadeIn);
      //     }
      //     const timeFromFadeout = time - entry.fadeOutStartTime;
      //     const fadeOut = getEasingSine(
      //         (entry.fadeOutTime - timeFromFadeout) / entry.fadeOutTime
      //     );
      //     if (fadeOut <= 1 && fadeOut > 0) {
      //         // console.log('fade out ' + fadeOut);
      //     } else if (fadeOut == 0) {
      //         // motion stoped!
      //         queue.terminate(entry);
      //     }
      //     const fadeWeight = 1 * fadeIn * fadeOut;
      //     // set stateweight
      //     entry.clip.evaluate(timeFromStart / 1000, model, fadeWeight);
      // }
    });
  }
}
