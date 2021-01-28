import { Injectable } from '@angular/core';
import { SystemBase } from '../ecs';
import { CubismModelComponent } from './model';
import { Keyboard, Mouse } from '../input';
import { vec2sub, GL2DRenderingContext, Transform2DComponent, Transform2D } from '../gl2d';

@Injectable()
export class CubismDragSystem extends SystemBase {

    constructor(
        private mouse: Mouse,
        private keyboard: Keyboard,
        private context: GL2DRenderingContext) {
        super([
            CubismModelComponent,
            Transform2DComponent
        ]);
    }

    allBeforeUpdate(): void {
        this.mouse.queue.forEach(s => {
            switch (s.type) {
                case 'mousedown':
                    this.onmousedown(s);
                    break;
                case 'mousewheel':
                    this.onomusewheel(s);
                    break;
            }
        });
    }

    onmousedown(e: {
        x: number, y: number
    }): void {
        const realPosition = this.context.screenToWorld(e);
        for (const entity of this.context.raycast(realPosition)) {
            const t = Transform2DComponent.oneFrom(entity).data;
            this.startCoroutine(this.drag(t));
            return;
        }
        this.startCoroutine(this.dragView());
    }

    onomusewheel(e: {
        x: number, y: number, delta: number
    }): void {
        const realPosition = this.context.screenToWorld(e);
        for (const entity of this.context.raycast(realPosition)) {
            const t = Transform2DComponent.oneFrom(entity).data;
            const orp = this.context.screenToObject(e, t.matrix);
            if (this.keyboard.isPressedKey('alt')) {
                if (e.delta > 0) {
                    t.matrix.adjustRotate(orp.x, orp.y, 0.1 * 3.1415926, [0, 0, 1]);
                } else if (e.delta < 0) {
                    t.matrix.adjustRotate(orp.x, orp.y, -0.1 * 3.1415926, [0, 0, 1]);
                }
            } else {
                if (e.delta > 0) {
                    t.matrix.adjustScale(orp.x, orp.y, 1.1);
                } else if (e.delta < 0) {
                    t.matrix.adjustScale(orp.x, orp.y, 0.9);
                }
            }
            return;
        }
        if (this.keyboard.isPressedKey('alt')) {
            if (e.delta > 0) {
                this.context.viewMatrix.adjustRotate(realPosition.x, realPosition.y, 0.1 * 3.1415926, [0, 0, 1]);
            } else if (e.delta < 0) {
                this.context.viewMatrix.adjustRotate(realPosition.x, realPosition.y, -0.1 * 3.1415926, [0, 0, 1]);
            }
        } else {
            if (e.delta > 0) {
                this.context.viewMatrix.adjustScale(realPosition.x, realPosition.y, 1.1);
            } else if (e.delta < 0) {
                this.context.viewMatrix.adjustScale(realPosition.x, realPosition.y, 0.9);
            }
        }
    }

    *drag(t: Transform2D): Generator<any, void, unknown> {
        let realPosition = (this.context.screenToWorld(this.mouse));
        const offset = vec2sub(realPosition, t.position);
        while (this.mouse.isPressed(0)) {
            realPosition = (this.context.screenToWorld(this.mouse));
            t.position = vec2sub(realPosition, offset);
            yield null;
        }
    }

    *dragView(): Generator<any, void, unknown> {
        let realPosition = this.context.screenToDevice(this.mouse);
        const offset = vec2sub(realPosition, this.context.position);
        while (this.mouse.isPressed(0)) {
            realPosition = this.context.screenToDevice(this.mouse);
            this.context.position = vec2sub(realPosition, offset);
            yield null;
        }
    }
}
