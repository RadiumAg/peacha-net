import { Component, HostListener, Input, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
	selector: 'ivo-carousel',
	templateUrl: './carousel.html',
	styleUrls: ['./carousel.less'],
	animations: [
		trigger('imgMove', [
			/** 不显示 */
			state('off', style({ display: 'none', 'z-index': '0', transform: 'translateX(0)' })),
			/** 上一张图片 */
			state(
				'prev',
				style({
					'z-index': '1',
					transform: 'translateX(-100%)',
				})
			),
			/** 下一张图片 */
			state('next', style({ 'z-index': '2', transform: 'translateX(100%)' })),
			/** 差距-2*/
			state('ltwo', style({ 'z-index': '3', transform: 'translateX(-100%)' })),
			/** 差距+2*/
			state('rthree', style({ 'z-index': '4', transform: 'translateX(100%)' })),
			/** 差距-3*/
			state('lthree', style({ 'z-index': '5', transform: 'translateX(-100%)' })),
			/** 差距+3*/
			state('rtwo', style({ 'z-index': '6', transform: 'translateX(100%)' })),
			/** 当前图片 */
			state('on', style({ 'z-index': '7', transform: 'translateX(0)' })),
			transition('prev=>on', [animate('0.3s ease-in')]),
			transition('next=>on', [animate('0.3s ease-in')]),
			transition('on=>prev', [animate('0.3s ease-in')]),
			transition('on=>next', [animate('0.3s ease-in')]),
			transition('on=>ltwo', [animate('0.3s ease-in')]),
			transition('on=>rtwo', [animate('0.3s ease-in')]),
			transition('on=>lthree', [animate('0.3s ease-in')]),
			transition('on=>rthree', [animate('0.3s ease-in')]),
			transition('ltwo=>on', [animate('0.3s ease-in')]),
			transition('rtwo=>on', [animate('0.3s ease-in')]),
			transition('lthree=>on', [animate('0.3s ease-in')]),
			transition('rthree=>on', [animate('0.3s ease-in')]),
		]),
	],
})
export class Carousel {
	@Input() imgs: any;

	current: number;
	clear: any;

	constructor(private cdr: ChangeDetectorRef) {
		this.current = 0;
		this.autoPlay();
	}

	@HostListener('mouseenter', ['$event.target']) onMouseEnter() {
		clearInterval(this.clear);
	}
	@HostListener('mouseout') onMouseOut() {
		this.autoPlay();
	}
	@HostListener('click') onClick() {
		clearInterval(this.clear);
	}

	ImgState(index: number) {
		if (this.imgs && this.imgs.length) {
			if (this.current === 0) {
				return index === 0
					? 'on'
					: index === 1
						? 'next'
						: index === 2
							? 'rtwo'
							: index === 3
								? 'rthree'
								: index === this.imgs.length - 1
									? 'prev'
									: 'off';
			} else if (this.current === this.imgs.length - 1) {
				return index === this.imgs.length - 1
					? 'on'
					: index === this.imgs.length - 2
						? 'prev'
						: index === this.imgs.length - 3
							? 'ltwo'
							: index === this.imgs.length - 4
								? 'lthree'
								: index === 0
									? 'next'
									: 'off';
			}
			switch (index - this.current) {
				case 0:
					return 'on';
				case 1:
					return 'next';
				case -1:
					return 'prev';
				case -2:
					return 'ltwo';
				case 2:
					return 'rtwo';
				case -3:
					return 'lthree';
				case 3:
					return 'rthree';
				default:
					return 'off';
			}
		} else {
			return 'off';
		}
	}

	Next() {
		this.current = (this.current + 1) % this.imgs.length;
	}
	Prev() {
		this.current = this.current - 1 < 0 ? this.imgs.length - 1 : this.current - 1;
	}

	toUrl(url: string) {
		window.open(url);
	}

	autoPlay() {
		clearInterval(this.clear);
		this.clear = setInterval(() => {
			this.cdr.markForCheck();
			if (this.current < this.imgs.length - 1) {
				this.current++;
			} else {
				this.current = 0;
			}
		}, 5000);
	}



	is_active(index: number) {
		return index == this.current;
	}

	//下标切换
	changeSmall(index: number) {
		this.current = index;
	}
}
