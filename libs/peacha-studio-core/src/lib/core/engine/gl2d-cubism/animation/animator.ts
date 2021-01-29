import { Component } from '../../ecs';
import { CubismAnimationClip } from './animation-clip';
import { CubismAnimationAction, CubismAnimationState } from './animation-action';

export class CubismAnimator {
	animationEntries: Set<CubismAnimationAction>;
	animationScheduled: Set<CubismAnimationAction>;
	animationWillFadeout: Set<CubismAnimationAction>;
	playingClips: Set<CubismAnimationClip>;

	clips: Array<CubismAnimationClip>;
	idleClips: Array<CubismAnimationClip>;

	constructor() {
		this.animationEntries = new Set();
		this.animationScheduled = new Set();
		this.animationWillFadeout = new Set();
		this.clips = [];
		this.playingClips = new Set();

		this.idleClips = [];
	}

	start(animationClip: CubismAnimationClip): CubismAnimationAction {
		const action = new CubismAnimationAction(animationClip, CubismAnimationState.Scheduled);
		this.animationScheduled.add(action);
		this.playingClips.add(animationClip);
		return action;
	}

	fadeout(action: CubismAnimationAction): void {
		this.animationWillFadeout.add(action);
	}

	terminate(action: CubismAnimationAction): void {
		if (!this.animationEntries.has(action)) {
			return;
		}
		action.state = CubismAnimationState.Terminated;
		this.animationEntries.delete(action);
		this.playingClips.delete(action.clip);
	}

	isPlaying(): boolean {
		return this.animationEntries.size > 0;
	}
}

export const CubismMotionComponent = Component.register<CubismAnimator>();
export const CubismExpressionComponent = Component.register<CubismAnimator>();
