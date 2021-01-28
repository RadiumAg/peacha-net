export type CubismMotionPoint = {
    time: number;
    value: number;
};

export enum CubismMotionCurveType {
    Model,
    Parameter,
    PartOpacity
}

export class CubismMotionCurve {
    type: CubismMotionCurveType; // model parameter partopacity
    target: number;
    segmentCount: number;
    baseSegmentIndex: number;
    fadeInTime: number;
    fadeOutTime: number;
}

export enum CubismMotionSegmentType {
    Linear,
    Bezier,
    Stepped,
    InverseSetpped
}

export type EvaluationFunction = (points: CubismMotionPoint[], time: number) => number;

export class CubismMotionSegment {
    evaluate: EvaluationFunction;
    basePointIndex: number;
    segmentType: CubismMotionSegmentType;
}

function lerpPoints(
    a: CubismMotionPoint,
    b: CubismMotionPoint,
    t: number
): CubismMotionPoint {
    return {
        time: a.time + (b.time - a.time) * t,
        value: a.value + (b.value - a.value) * t
    };
}

export function linearEvaluate(points: CubismMotionPoint[], time: number): number {
    let t: number = (time - points[0].time) / (points[1].time - points[0].time);

    if (t < 0.0) {
        t = 0.0;
    }

    return points[0].value + (points[1].value - points[0].value) * t;
}

export function bezierEvaluate(points: CubismMotionPoint[], time: number): number {
    let t: number = (time - points[0].time) / (points[3].time - points[0].time);

    if (t < 0.0) {
        t = 0.0;
    }

    const p01: CubismMotionPoint = lerpPoints(points[0], points[1], t);
    const p12: CubismMotionPoint = lerpPoints(points[1], points[2], t);
    const p23: CubismMotionPoint = lerpPoints(points[2], points[3], t);

    const p012: CubismMotionPoint = lerpPoints(p01, p12, t);
    const p123: CubismMotionPoint = lerpPoints(p12, p23, t);

    return lerpPoints(p012, p123, t).value;
}

export function steppedEvaluate(points: CubismMotionPoint[], time: number): number {
    return points[0].value;
}

export function inverseSteppedEvaluate(
    points: CubismMotionPoint[],
    time: number
): number {
    return points[1].value;
}
