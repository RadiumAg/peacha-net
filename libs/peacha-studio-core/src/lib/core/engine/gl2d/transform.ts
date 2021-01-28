import { Vector2, Matrix44, vec2 } from './math';
import { Component } from '../ecs/component';

export class Transform2D {

    constructor(public matrix: Matrix44) { }

    public get position(): Vector2 {
        return vec2(this.matrix.getTranslateX(), this.matrix.getTranslateY());
    }
    public set position(vec: Vector2) {
        this.matrix.translate(vec.x, vec.y);
    }

    public get scale(): Vector2 {
        return vec2(this.matrix.getScaleX(), this.matrix.getScaleY());
    }
    public set scale(v: Vector2) {
        this.matrix.scale(v.x, v.y);
    }
}

export const Transform2DComponent = Component.register<Transform2D>();
