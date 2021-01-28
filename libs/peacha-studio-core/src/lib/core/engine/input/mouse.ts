import { SystemBase } from '../ecs/system';
import { Inject, Injectable } from '@angular/core';
import { DOM_ELEMENT } from '../ecs/world';
import { IOEvent } from './events';

export class Mouse {

  pressed: {
    [button: number]: boolean
  } = {};

  queue: Array<IOEvent> = [];

  x: number;
  y: number;

  lastPressure: Array<IOEvent> = [];

  isPressed(...buttons: number[]): boolean {
    return buttons.every(b => this.pressed[b] == true);
  }
}

@Injectable()
export class DomMouseSystem extends SystemBase {
  constructor(@Inject(DOM_ELEMENT) private domElement: HTMLElement
    ,         private mouse: Mouse) {
    super();
    domElement.addEventListener('mousemove', this._mousemove.bind(this));
    domElement.addEventListener('mouseup', this._mouseup.bind(this));
    domElement.addEventListener('mousedown', this._mousedown.bind(this));
    if (typeof WheelEvent) {
      domElement.addEventListener('mousewheel', this._wheel.bind(this));
    } else {
      domElement.addEventListener('DOMMouseScroll', this._wheel.bind(this));
    }
  }

  allBeforeUpdate(): void {
    const queue = [];
    // 合并IO操作
    let lastMoveIndex = -1;
    let lastUpIndex = -1;
    let lastDownIndex = -1;
    for (let i = 0; i < this.mouse.lastPressure.length; i++) {
      const element = this.mouse.lastPressure[i];
      if (element.type == 'mousemove') {
        queue.push(element);
        if (lastMoveIndex > 0) {
          queue[lastMoveIndex] = null;
        }
        lastMoveIndex = i;
      } else if (element.type == 'mousedown') {
        if (lastUpIndex >= 0) {
          delete queue[lastUpIndex];
        } else {
          queue.push(element);
        }
        lastDownIndex = i;
      } else if (element.type == 'mouseup') {
        if (lastDownIndex >= 0) {
          delete queue[lastDownIndex];
        } else {
          queue.push(element);
        }
        lastUpIndex = i;
      } else if (element.type == 'mousewheel') {
        queue.push(element);
      }
    }
    if (lastUpIndex >= 0 || lastDownIndex >= 0) {
      for (let i = 0; i < queue.length; i++) {
        if (queue[i]) {
          if (queue[i].type == 'mousemove') {
            queue[i] = null;
          } else {
            break;
          }
        }
      }
    }
    this.mouse.queue = queue.filter(s => s);
    this.mouse.lastPressure = [];
  }

  _mousemove(ev: MouseEvent): void {
    this.mouse.x = ev.offsetX;
    this.mouse.y = ev.offsetY;
    this.mouse.lastPressure.push({
      type: 'mousemove',
      x: ev.offsetX,
      y: ev.offsetY
    });
  }

  _mouseup(ev: MouseEvent): void {
    this.mouse.pressed[ev.button] = false;
    this.mouse.lastPressure.push({
      type: 'mouseup',
      x: ev.offsetX,
      y: ev.offsetY,
      button: ev.button
    });
  }

  _mousedown(ev: MouseEvent): void {
    this.mouse.pressed[ev.button] = true;
    this.mouse.lastPressure.push({
      type: 'mousedown',
      x: ev.offsetX,
      y: ev.offsetY,
      button: ev.button
    });
  }

  _wheel(ev: WheelEvent): void {
    this.mouse.lastPressure.push({
      type: 'mousewheel',
      x: ev.offsetX,
      y: ev.offsetY,
      delta: ev.deltaY
    });
  }

  onDestroy(): void {
    this.domElement.removeEventListener('mousemove', this._mousemove.bind(this));
    this.domElement.removeEventListener('mouseup', this._mouseup.bind(this));
    this.domElement.removeEventListener('mousedown', this._mousedown.bind(this));
    if (typeof WheelEvent) {
      this.domElement.removeEventListener('mousewheel', this._wheel.bind(this));
    } else {
      this.domElement.removeEventListener('DOMMouseScroll', this._wheel.bind(this));
    }
  }
}
