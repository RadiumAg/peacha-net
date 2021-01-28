import { CubismMath } from './cubism-math';
import { Inject, Injectable } from '@angular/core';
import { DOM_ELEMENT } from '../ecs/world';
import { CubismModelComponent } from './model';
import {
  GL2DRenderingContext,
  Transform2D,
  Transform2DComponent,
  vec2sub,
} from '../gl2d';
import { SystemBase } from '../ecs';

@Injectable()
export class TouchDragSystem extends SystemBase {
  lastPressure: {
    type: 'touchstart' | 'touchmove' | 'touchend';
    x: number;
    y: number;
  }[] = [];

  lastScale: {
    x: number;
    y: number;
    scale: number;
  }[] = [];
  lastScaleMagnification = 1;
  lastScaleBuffer = 1;

  moving = false;

  touches: Touch[];
  scaleParam: number;

  constructor(
    @Inject(DOM_ELEMENT) private domElement: HTMLElement,
    private context: GL2DRenderingContext
  ) {
    super([CubismModelComponent, Transform2DComponent]);
    domElement.addEventListener('touchstart', this.touchStart.bind(this));
    domElement.addEventListener('touchmove', this.touchMove.bind(this));
    domElement.addEventListener('touchend', this.touchEnd.bind(this));
  }

  touchStart(event: TouchEvent): void {
    this.touches = Array.from(event.targetTouches);
    if (event.targetTouches.length === 2) {
      this.moving = true;
      this.scaleParam = CubismMath.distance(
        {
          x: event.targetTouches[0].clientX,
          y: event.targetTouches[0].clientY,
        },
        {
          x: event.targetTouches[1].clientX,
          y: event.targetTouches[1].clientY,
        }
      );
    }
  }
  touchMove(event: TouchEvent): void {
    this.touches = Array.from(event.targetTouches);
    if (event.targetTouches.length === 2) {
      this.lastScale.push({
        x:
          (event.targetTouches[0].clientX + event.targetTouches[1].clientX) / 2,
        y:
          (event.targetTouches[0].clientY + event.targetTouches[1].clientY) / 2,
        scale:
          CubismMath.distance(
            {
              x: event.targetTouches[0].clientX,
              y: event.targetTouches[0].clientY,
            },
            {
              x: event.targetTouches[1].clientX,
              y: event.targetTouches[1].clientY,
            }
          ) / this.scaleParam,
      });
    }
  }
  touchEnd(event: TouchEvent): void {
    this.touches = Array.from(event.targetTouches);
    this.lastPressure.length = 0;
    this.lastScale.length = 0;
    this.moving = false;

    this.lastScaleBuffer = this.lastScaleMagnification;
  }

  allBeforeUpdate(): void {
    this.lastPressure.forEach((item) => {
      const realPosition = this.context.screenToWorld(item);
      for (const entity of this.context.raycast(realPosition)) {
        const t = Transform2DComponent.oneFrom(entity).data;
        this.startCoroutine(this.drag(t));
        return;
      }
      this.startCoroutine(this.dragView());
    });
    this.lastPressure.length = 0;

    this.lastScale.forEach((item) => {
      this.startCoroutine(this.scale(item.scale));
      const realPosition = this.context.screenToWorld(item);
      for (const entity of this.context.raycast(realPosition)) {
        const t = Transform2DComponent.oneFrom(entity).data;
        this.startCoroutine(this.scaleDrag(t));
        return;
      }
      this.startCoroutine(this.scaleDragView());
    });
    this.lastScale.length = 0;
  }

  onDestroy(): void {
    this.domElement.removeEventListener(
      'touchstart',
      this.touchStart.bind(this)
    );
    this.domElement.removeEventListener('touchmove', this.touchMove.bind(this));
    this.domElement.removeEventListener('touchend', this.touchEnd.bind(this));
    this.lastPressure.length = 0;
  }

  *drag(t: Transform2D): Generator<any, void, unknown> {
    if (this.touches.length === 0) {
      return;
    }
    const dpr = window.devicePixelRatio;
    let realPosition = this.context.screenToWorld({
      x: this.touches[0].clientX * dpr,
      y: this.touches[0].clientY * dpr,
    });
    const offset = vec2sub(realPosition, t.position);
    while (this.moving) {
      realPosition = this.context.screenToWorld({
        x: this.touches[0].clientX * dpr,
        y: this.touches[0].clientY * dpr,
      });
      t.position = vec2sub(realPosition, offset);
      yield null;
    }
  }

  *dragView(): Generator<any, void, unknown> {
    if (this.touches.length === 0) {
      return;
    }
    const dpr = window.devicePixelRatio;
    let realPosition = this.context.screenToDevice({
      x: this.touches[0].clientX * dpr,
      y: this.touches[0].clientY * dpr,
    });
    const offset = vec2sub(realPosition, this.context.position);
    while (this.moving) {
      realPosition = this.context.screenToDevice({
        x: this.touches[0].clientX * dpr,
        y: this.touches[0].clientY * dpr,
      });
      this.context.position = vec2sub(realPosition, offset);
      yield null;
    }
  }

  *scaleDrag(t: Transform2D): Generator<any, void, unknown> {
    if (this.touches.length < 2) {
      return;
    }
    const dpr = window.devicePixelRatio;
    let realPosition = this.context.screenToWorld({
      x: ((this.touches[0].clientX + this.touches[1].clientX) / 2) * dpr,
      y: ((this.touches[0].clientY + this.touches[1].clientY) / 2) * dpr,
    });
    const offset = vec2sub(realPosition, t.position);
    while (this.moving) {
      realPosition = this.context.screenToWorld({
        x: ((this.touches[0].clientX + this.touches[1].clientX) / 2) * dpr,
        y: ((this.touches[0].clientY + this.touches[1].clientY) / 2) * dpr,
      });
      t.position = vec2sub(realPosition, offset);
      yield null;
    }
  }

  *scaleDragView(): Generator<any, void, unknown> {
    if (this.touches.length < 2) {
      return;
    }
    const dpr = window.devicePixelRatio;
    let realPosition = this.context.screenToDevice({
      x: ((this.touches[0].clientX + this.touches[1].clientX) / 2) * dpr,
      y: ((this.touches[0].clientY + this.touches[1].clientY) / 2) * dpr,
    });
    const offset = vec2sub(realPosition, this.context.position);
    while (this.moving) {
      realPosition = this.context.screenToDevice({
        x: ((this.touches[0].clientX + this.touches[1].clientX) / 2) * dpr,
        y: ((this.touches[0].clientY + this.touches[1].clientY) / 2) * dpr,
      });
      this.context.position = vec2sub(realPosition, offset);
      yield null;
    }
  }

  *scale(scale: number): Generator<any, void, unknown> {
    if (this.touches.length < 2) {
      return;
    }
    const dpr = window.devicePixelRatio;
    while (this.moving) {
      this.context.currentRendering.forEach((item) => {
        item.transform.scale = {
          x: this.lastScaleBuffer * scale * dpr,
          y: this.lastScaleBuffer * scale * dpr,
        };
        this.lastScaleMagnification = item.transform.scale.x / dpr;
      });
      yield null;
    }
  }
}
