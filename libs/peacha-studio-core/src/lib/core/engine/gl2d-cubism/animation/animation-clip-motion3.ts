import { CubismAnimationClip } from './animation-clip';
import { CubismModel } from '../model';
import { CubismMotionPoint, CubismMotionSegment, CubismMotionCurve, CubismMotionSegmentType } from './animation-internal';

export class CubismAnimationMotion3Clip extends CubismAnimationClip {
	// events

	constructor(
		public readonly duration: number,
		public readonly fps: number,
		public readonly curves: Array<CubismMotionCurve>,
		public readonly segments: Array<CubismMotionSegment>,
		public readonly points: Array<CubismMotionPoint>,
		public readonly name: string,
		public readonly idle = false
	) {
		super();
	}

	evaluate(
		usertime: number,
		model: CubismModel
		// refWeight: number //已计算出由crossfade造成的混合权重影响
	): void {
		const curves = this.curves;
		const linSyncFloags = 0;
		const eyeBlinkFlags = 0;
		let i = 0;

		//#region model curve
		for (; i < curves.length && curves[i].type == 0; i++) {
			const value = this.evaluateCurve(i, usertime);
			// do nothing
		}
		//#endregion
		//#region parameter curve
		for (; i < curves.length && curves[i].type == 1; i++) {
			const sourceValue = model.getParameterByIndex(curves[i].target);

			const value = this.evaluateCurve(i, usertime);

			// 权重会导致参数计算错误
			// const v = sourceValue + (value - sourceValue) * refWeight;
			model.setParameterByIndex(curves[i].target, value);
		}
		//#endregion
		//#region part opacity curve
		for (; i < curves.length && curves[i].type == 2; i++) {
			const value = this.evaluateCurve(i, usertime);
		}
		//#endregion
	}

	private evaluateCurve(index: number, time: number): number {
		// Find segment to evaluate.
		const curve = this.curves[index];

		let target = -1;
		const totalSegmentCount: number = curve.baseSegmentIndex + curve.segmentCount;
		let pointPosition = 0;
		for (let i: number = curve.baseSegmentIndex; i < totalSegmentCount; ++i) {
			// Get first point of next segment.
			pointPosition = this.segments[i].basePointIndex + (this.segments[i].segmentType == CubismMotionSegmentType.Bezier ? 3 : 1);

			// Break if time lies within current segment.
			if (this.points[pointPosition].time > time) {
				target = i;
				break;
			}
		}

		if (target == -1) {
			return this.points[pointPosition].value;
		}

		const segment: CubismMotionSegment = this.segments[target];

		return segment.evaluate(
			this.points.slice(segment.basePointIndex), // TODO: 新算法减少空间分配
			time
		);
	}
}
