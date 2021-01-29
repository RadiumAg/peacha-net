import { Component, HostBinding, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, group, query, style, animate } from '@angular/animations';
import { STEP_NAVIGATE, StepNavigatable } from './step-navigatable';

@Component({
	selector: '*[ivoStepper]',
	templateUrl: './steps.html',
	styleUrls: ['./steps.less'],
	exportAs: 'steps',
	animations: [
		// 这些动画都太糟糕了
		trigger('slider', [
			transition(
				':increment',
				group([
					query(':enter', [
						style({
							position: 'relative',
						}),
						style({
							transform: 'translateX(100px)',
							opacity: 0,
						}),
						animate('0.3s ease-in', style('*')),
						style({
							position: 'absolute',
						}),
					]),
					query(':leave', [
						style({
							position: 'absolute',
						}),
						animate(
							'0.3s ease-out',
							style({
								// transform: 'translateX(-100px)',
								opacity: 0,
							})
						),
					]),
				])
			),
			transition(
				':decrement',
				group([
					query(':enter', [
						style({
							position: 'absolute',
						}),
						style({
							transform: 'translateX(-100px)',
							opacity: 0,
						}),
						animate(
							'0.3s ease-in',
							style({
								position: 'absolute',
								transform: 'translateX(0)',
								opacity: 1,
							})
						),
						style({
							position: 'relative',
						}),
					]),
					query(':leave', [
						style({
							position: 'absolute',
						}),
						animate(
							'0.3s ease-out',
							style({
								transform: 'translateX(100px)',
								opacity: 0,
							})
						),
					]),
				])
			),
		]),
	],
	providers: [
		{
			provide: STEP_NAVIGATE,
			useExisting: Steps,
		},
	],
})
export class Steps implements StepNavigatable {
	currentStepIndex = 0;

	stepCount = 0;
	steps: Array<string | undefined> = [];

	@HostBinding('@slider')
	get sliderIndex() {
		return this.currentStepIndex;
	}

	constructor(private cdr: ChangeDetectorRef) {}

	public addStep(step?: string) {
		this.steps.push(step);
		return this.stepCount++;
	}

	public next() {
		if (this.currentStepIndex + 1 < this.stepCount) {
			this.currentStepIndex++;
			this.cdr.markForCheck();
		}
	}

	public previous() {
		if (this.currentStepIndex > 0) {
			this.currentStepIndex--;
			this.cdr.markForCheck();
		}
	}

	public goto(step: string | number) {
		if (typeof step == 'number') {
			if (step > 0 && step < this.stepCount) {
				this.currentStepIndex = step;
				this.cdr.markForCheck();
			}
		} else {
			const target = this.steps.findIndex(s => s == step);
			if (target != -1) {
				this.currentStepIndex = target;
				this.cdr.markForCheck();
			}
		}
	}
}
