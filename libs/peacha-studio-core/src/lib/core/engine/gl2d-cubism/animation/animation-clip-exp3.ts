import { CubismAnimationClip } from './animation-clip';
import { CubismModel } from '../model';

enum ExpressionBlendType {
	ExpressionBlendType_Add = 0, // 加算
	ExpressionBlendType_Multiply = 1, // 乗算
	ExpressionBlendType_Overwrite = 2, // 上書き
}

type ExpressionClipParameter = {
	id: string;
	blend: ExpressionBlendType;
	value: number;
};

export class CubismAnimationExp3Clip extends CubismAnimationClip {
	constructor(
		public readonly faceInTime: number,
		public readonly faceOutTime: number,
		public readonly parameters: Array<ExpressionClipParameter>,
		public readonly name: string
	) {
		super();
	}

	evaluate(
		usertime: number,
		model: CubismModel,
		refWeight: number // 已计算出由crossfade造成的混合权重影响
	): void {
		this.parameters.forEach(parameter => {
			switch (parameter.blend) {
				case ExpressionBlendType.ExpressionBlendType_Add: {
					model.addParameterById(parameter.id, parameter.value, refWeight);
					break;
				}
				case ExpressionBlendType.ExpressionBlendType_Multiply: {
					model.multiplyParameterById(parameter.id, parameter.value, refWeight);
					break;
				}
				case ExpressionBlendType.ExpressionBlendType_Overwrite: {
					model.setParameterById(parameter.id, parameter.value, refWeight);
					break;
				}
				default:
					// 仕様にない値を設定した時はすでに加算モードになっている
					break;
			}
		});
	}
}
