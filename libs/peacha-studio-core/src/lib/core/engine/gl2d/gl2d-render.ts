import { SystemBase } from '../ecs/system';
import { Injectable, Inject } from '@angular/core';
import { Component } from '../ecs/component';
import { DOM_ELEMENT } from '../ecs/world';
import { Entity } from '../ecs/entity';
import { Vector2, Matrix44, vec2 } from './math';
import { Transform2DComponent, Transform2D } from './transform';
import { getWebGLContext } from '../utils';
import { CubismShaderWebGL } from '../gl2d-cubism/render/webgl-shader';

export interface GL2DRenderable {

  order: number;
  draw(mvpMatrix: Matrix44): void;
  hit(position: Vector2): boolean;
}

export const GL2DRenderComponent = Component.register<GL2DRenderable>();

@Injectable()
export class GL2DRenderingContext {

  public get position(): Vector2 {
    return vec2(this.viewMatrix.getTranslateX(), this.viewMatrix.getTranslateY());
  }
  public set position(vec: Vector2) {
    this.viewMatrix.translate(vec.x, vec.y);
  }
  gl: WebGLRenderingContext;
  viewMatrix: Matrix44 = new Matrix44();
  deviceToScreen: Matrix44 = new Matrix44();
  projectionMatrix: Matrix44 = new Matrix44();

  needsUpdateOrder = false;

  currentRendering: {
    entity: Entity;
    renderable: GL2DRenderable;
    transform: Transform2D;
  }[] = []; // ordered cache?

  rt: number;

  *raycast(position: Vector2): Iterable<Entity> {
    for (let index = 0; index < this.currentRendering.length; index++) {
      const element = this.currentRendering[index];
      const td = this.worldToObject(position, element.transform.matrix);
      if (element.renderable.hit(
        td
      )) {
        yield element.entity;
      }
    }
  }

  screenToDevice(e: {
    x: number, y: number
  }): Vector2 {
    return this.deviceToScreen.multiplyByVector(e);
  }

  screenToWorld(e: {
    x: number, y: number
  }): Vector2 {
    const d = this.deviceToScreen.multiplyByVector(e);
    const k = this.viewMatrix.invert().multiplyByVector(d);
    return k;
  }

  screenToObject(e: {
    x: number, y: number
  },             matrix: Matrix44): Vector2 {
    return matrix.invert().multiplyByVector(this.screenToWorld(e));
    // console.log('map to view: ' + k.x + ' ' + k.y);
  }

  worldToObject(e: {
    x: number, y: number
  },            matrix: Matrix44): Vector2 {
    return matrix.invert().multiplyByVector(e);
  }

  worldToScreen(): void {

  }

  resizeFromCanvas(canvas: HTMLCanvasElement): void {
    const width = canvas.width;
    const height = canvas.height;
    const ratio = height / width;
    // const left = ratio > 1 ? -ratio : -1;
    // const right = ratio > 1 ? ratio : 1;
    // const bottom = ratio > 1 ? -1 : -ratio;
    // const top = ratio > 1 ? 1 : ratio;
    const left = -1;
    const right = 1;
    const bottom = -ratio;
    const top = ratio;

    const screenW: number = Math.abs(left - right);
    this.deviceToScreen = new Matrix44();
    this.deviceToScreen.scale(screenW / width, -screenW / width);
    this.deviceToScreen.translateRelative(-width * 0.5, -height * 0.5);

    const pixelToCordRation = 2000; // constant
    const rt = pixelToCordRation / width;
    const bound = 1 / rt;
    const bound2 = 1 / rt / (width / height);

    // this.viewMatrix.scale(0.5,0.5);

    // this.rt = rt;
    this.rt = 1;

    this.projectionMatrix.scale(1, 1 * (width / height));
    this.gl.viewport(0, 0, canvas.width, canvas.height);
  }

  add(r: Entity): void {
    const renderable = GL2DRenderComponent.oneFrom(r);
    for (let index = 0; index < this.currentRendering.length; index++) {
      const element = this.currentRendering[index];
      if (renderable.data.order < element.renderable.order) {
        this.currentRendering.splice(index, 0, {
          entity: r,
          renderable: renderable.data,
          transform: Transform2DComponent.oneFrom(r).data
        });
        return;
      }
    }
    this.currentRendering.push({
      entity: r,
      renderable: renderable.data,
      transform: Transform2DComponent.oneFrom(r).data
    });
  }

  remove(r: Entity): void {
    for (let index = 0; index < this.currentRendering.length; index++) {
      const element = this.currentRendering[index];
      if (element.entity == r) {
        this.currentRendering.splice(index, 1);
        return;
      }
    }
    throw new Error('entity doesn\'t exist.');
  }
}

@Injectable()
export class GL2DRenderingSystem extends SystemBase {

  constructor(
    @Inject(DOM_ELEMENT) private canvas: HTMLCanvasElement,
    private context: GL2DRenderingContext
  ) {
    super([GL2DRenderComponent, Transform2DComponent]);
    context.gl = getWebGLContext(canvas);
    context.resizeFromCanvas(canvas);
    canvas.addEventListener('resize', this._canvasResize.bind(this));
  }

  onDestroy(): void {
    this.canvas.removeEventListener('resize', this._canvasResize.bind(this));
    CubismShaderWebGL.deleteInstance(this.id);
  }

  _canvasResize(e: Event): void {
    this.context.resizeFromCanvas(this.canvas);
  }

  allBeforeUpdate(): void {
    this.context.gl.clearColor(0, 0, 0, 0);
    this.context.gl.clear(this.context.gl.COLOR_BUFFER_BIT);
  }

  allAfterUpdate(): void {
    if (this.context.needsUpdateOrder) {
      this.context.currentRendering.sort((a, b) => {
        return a.renderable.order - b.renderable.order;
      });
    }
    const vpMatrix = new Matrix44();
    vpMatrix.multiplyByMatrix(this.context.viewMatrix);
    vpMatrix.multiplyByMatrix(this.context.projectionMatrix);
    for (const ele of this.context.currentRendering) {
      const m = ele.transform.matrix.clone();
      m.multiplyByMatrix(vpMatrix);
      ele.renderable.draw(m);
    }
  }

  enter(entity: Entity): void {
    this.context.add(entity);
  }

  exit(entity: Entity): void {
    this.context.remove(entity);
  }
}
