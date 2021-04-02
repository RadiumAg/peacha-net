import { Component, Input } from '@angular/core';
import { trigger, transition, state, animate, style, keyframes, query, group } from '@angular/animations';

@Component({
	selector: 'ivo-work-actions',
	templateUrl: './work-actions.component.html',
	styleUrls: ['./work-actions.component.less'],
	animations: [
		trigger('like', [
			state(
				'1',
				style({
					backgroundColor: 'rgba(255,240,245,1);',
				})
			),
			state(
				'0',
				style({
					backgroundColor: 'rgba(255,255,255,1);',
				})
			),
			transition('0 => 1', [
				group([
					query(
						'span',
						animate(
							'1000ms',
							keyframes([
								style({ offset: 0 }),
								style({ width: 0, opacity: 0, offset: 0.2 }),
								style({ width: 0, opacity: 0, offset: 0.5 }),
								style({ width: 0, opacity: 0, offset: 0.8 }),
								style({ offset: 1 }),
							])
						)
					),
					query(
						'img',
						animate(
							'1000ms',
							keyframes([
								style({ offset: 0 }),
								style({ transform: 'scale(1.2)', offset: 0.2 }),
								style({ transform: 'scale(1.2)', offset: 0.5 }),
								style({ transform: 'scale(1.2)', offset: 0.8 }),
								style({ offset: 1 }),
							])
						)
					),
				]),
			]),
		]),
	],
})
export class WorkActionsComponent {
	constructor() { }

	@Input() work: {
		id: number;
		isLike: number;
		likeCount: number;
		isCollect: number;
		collectCount: number;
	};
}
