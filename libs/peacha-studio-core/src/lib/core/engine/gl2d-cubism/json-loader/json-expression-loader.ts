import { CubismAnimationClip } from '../animation';
import { CubismAnimationExp3Clip } from '../animation/animation-clip-exp3';

export enum ExpressionBlendType {
	ExpressionBlendType_Add = 0, // 加算
	ExpressionBlendType_Multiply = 1, // 乗算
	ExpressionBlendType_Overwrite = 2, // 上書き
}

export type ExpressionClipParameter = {
	id: string;
	blend: ExpressionBlendType;
	value: number;
};

export type ExpressionParameter = {
	Id: string;
	Value: number;
	Blend: string;
};

export type CubismExpJson = {
	FadeInTime: number;
	FadeOutTime: number;
	Type: string;
	Parameters: ExpressionParameter[];
};

export function loadCubismExpressionFromJson(def: CubismExpJson, name: string): CubismAnimationClip {
	const fadeInTime = def.FadeInTime === undefined ? def.FadeInTime : 1;
	const fadeOutTime = def.FadeOutTime === undefined ? def.FadeOutTime : 1;
	const parameters: ExpressionClipParameter[] = def.Parameters.map(parameter => {
		const id = parameter.Id;
		const value = parameter.Value;
		let blend = ExpressionBlendType.ExpressionBlendType_Add;
		if (parameter.Blend === 'Add') {
			blend = ExpressionBlendType.ExpressionBlendType_Add;
		} else if (parameter.Blend === 'Multiply') {
			blend = ExpressionBlendType.ExpressionBlendType_Multiply;
		} else if (parameter.Blend === 'Overwrite') {
			blend = ExpressionBlendType.ExpressionBlendType_Overwrite;
		}
		return {
			id,
			value,
			blend,
		};
	});
	return new CubismAnimationExp3Clip(fadeInTime, fadeOutTime, parameters, name);
}
