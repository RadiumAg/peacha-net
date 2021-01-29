import { CubismAnimationClip } from './animation-clip';

export class CubismAnimationAction {
	public fadeOutStartTime: number;

	public startTime: number;
	public endTime: number; // 通过调整endtime控制动画结束我觉得不太行，

	public fadeInTime: number;
	public fadeOutTime: number;

	constructor(public readonly clip: CubismAnimationClip, public state: CubismAnimationState) {
		this.fadeInTime = 1000;
		this.fadeOutTime = 1000;
	}
}

export enum CubismAnimationState {
	Scheduled = 0,
	Playing = 1,
	Terminated = 2,
	FadingIn = 4, // ?
	FadingOut = 8, // ?
}
