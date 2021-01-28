import { CubismModel } from '../model';

export abstract class CubismAnimationClip {

    idle = false;

    duration: number;
    fps: number;
    fadeIn: number; // default value
    fadeOut: number; // default value

    constructor() {
    }

    abstract evaluate(
        usertime: number,
        model: CubismModel,
        refWeight: number // 已计算出由crossfade造成的混合权重影响
    ): void;
}

// 占位，当不存在动画时使用
export class CubismEmptyIdleClip extends CubismAnimationClip {

    idle = true;

    constructor() {
        super();
        this.duration = Number.MAX_VALUE;
    }

    evaluate(usertime: number, model: CubismModel, weight: number): void {
        // breath
        model.setParameterByIndex(model.PARAM_BREATH, Math.sin(usertime), weight);

        // auto eyeblink ??!

        // head movement
    }
}
