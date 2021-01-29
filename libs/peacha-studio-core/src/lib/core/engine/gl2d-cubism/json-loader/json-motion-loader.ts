import { CubismModel } from '../model';
import {
	CubismMotionCurve,
	CubismMotionSegment,
	CubismMotionPoint,
	CubismMotionSegmentType,
	linearEvaluate,
	bezierEvaluate,
	steppedEvaluate,
	inverseSteppedEvaluate,
} from '../animation/animation-internal';
import { CubismAnimationMotion3Clip } from '../animation/animation-clip-motion3';
import { CubismAnimationClip } from '../animation/animation-clip';

type Curve = {
	Target: string;
	Id: string;
	FadeInTime?: number;
	FadeOutTime?: number;
	Segments: number[];
};

type MotionUserData = {
	Time: number;
	Value: string;
};

type CubismMotionJson = {
	Meta: {
		Duration: number;
		Fps: number;
		Loop?: boolean;
		AreBeziersRestricted?: boolean;
		FadeInTime?: number;
		FadeOutTime?: number;
		CurveCount: number;
		TotalSegmentCount: number;
		TotalPointCount: number;
		UserDataCount?: number;
		TotalUserDataSize?: number;
	};
	Curves: Curve[];
	UserData?: MotionUserData[];
};

export function loadCubismMotionClipFromJson(model: CubismModel, def: CubismMotionJson, name: string, idle = false): CubismAnimationClip {
	const curves = new Array(def.Meta.CurveCount).fill(null).map(x => new CubismMotionCurve());
	const segments = new Array(def.Meta.TotalSegmentCount).fill(null).map(x => new CubismMotionSegment());
	const points: CubismMotionPoint[] = new Array(def.Meta.TotalPointCount).fill(null);
	const userdata = new Array(def.Meta.TotalUserDataSize);

	let totalSegmentCount = 0;
	let totalPointCount = 0;

	// curves
	for (let i = 0; i < curves.length; i++) {
		const curve = curves[i];
		curve.type = targetMap[def.Curves[i].Target];
		switch (curve.type) {
			case 0:
				// diandiandian
				break;
			case 1:
				curve.target = model.getParameterIndex(def.Curves[i].Id);
				break;
			case 2:
				curve.target = model.getPartIndex(def.Curves[i].Id);
				break;
			default:
				throw new Error(`Not a valid curve target: ${def.Curves[i].Target}`);
		}
		curve.baseSegmentIndex = totalSegmentCount;
		curve.fadeInTime = 1.0; // ?
		curve.fadeOutTime = 1.0; // ?
		curve.segmentCount = 0;

		for (let segmentPosition = 0; segmentPosition < def.Curves[i].Segments.length; ) {
			if (segmentPosition == 0) {
				segments[totalSegmentCount].basePointIndex = totalPointCount;
				points[totalPointCount] = {
					time: def.Curves[i].Segments[segmentPosition],
					value: def.Curves[i].Segments[segmentPosition + 1],
				};
				totalPointCount += 1;
				segmentPosition += 2;
			} else {
				segments[totalSegmentCount].basePointIndex = totalPointCount - 1;
			}

			const segment: number = def.Curves[i].Segments[segmentPosition];
			segments[totalSegmentCount].segmentType = segment;
			switch (segment) {
				case CubismMotionSegmentType.Linear:
					segments[totalSegmentCount].evaluate = linearEvaluate;
					points[totalPointCount] = {
						time: def.Curves[i].Segments[segmentPosition + 1],
						value: def.Curves[i].Segments[segmentPosition + 2],
					};
					totalPointCount += 1;
					segmentPosition += 3;
					break;
				case CubismMotionSegmentType.Bezier:
					segments[totalSegmentCount].evaluate = bezierEvaluate;
					points[totalPointCount] = {
						time: def.Curves[i].Segments[segmentPosition + 1],
						value: def.Curves[i].Segments[segmentPosition + 2],
					};
					points[totalPointCount + 1] = {
						time: def.Curves[i].Segments[segmentPosition + 3],
						value: def.Curves[i].Segments[segmentPosition + 4],
					};
					points[totalPointCount + 2] = {
						time: def.Curves[i].Segments[segmentPosition + 5],
						value: def.Curves[i].Segments[segmentPosition + 6],
					};
					totalPointCount += 3;
					segmentPosition += 7;
					break;
				case CubismMotionSegmentType.Stepped:
					segments[totalSegmentCount].evaluate = steppedEvaluate;
					points[totalPointCount] = {
						time: def.Curves[i].Segments[segmentPosition + 1],
						value: def.Curves[i].Segments[segmentPosition + 2],
					};
					totalPointCount += 1;
					segmentPosition += 3;
					break;
				case CubismMotionSegmentType.InverseSetpped:
					segments[totalSegmentCount].evaluate = inverseSteppedEvaluate;
					points[totalPointCount] = {
						time: def.Curves[i].Segments[segmentPosition + 1],
						value: def.Curves[i].Segments[segmentPosition + 2],
					};
					totalPointCount += 1;
					segmentPosition += 3;
					break;
			}

			curve.segmentCount++;
			totalSegmentCount++;
		}
	}

	const motionClip = new CubismAnimationMotion3Clip(def.Meta.Duration * 1000, def.Meta.Fps, curves, segments, points, name, idle);
	// 整活戝功
	return motionClip;
}

const targetMap = {
	Model: 0,
	Parameter: 1,
	PartOpacity: 2,
};
