import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ModalService } from '@peacha-core';
import { N7rGoodDetail } from './components/good-detail/good-detail';
import { N7rPlay } from './components/play/play';
import { N7rApiService } from './n7r-api.service';

@Component({
	selector: 'ivo-n7r',
	templateUrl: './n7r.page.html',
	styleUrls: ['./n7r.page.less'],
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
			/** 当前图片 */
			state('on', style({ 'z-index': '7', transform: 'translateX(0)' })),
			transition('prev=>on', [animate('0.3s ease-in')]),
			transition('next=>on', [animate('0.3s ease-in')]),
			transition('on=>prev', [animate('0.3s ease-in')]),
			transition('on=>next', [animate('0.3s ease-in')]),
		]),
	],
})
export class N7rPage {
	@ViewChild('detail') content: ElementRef;
	constructor(
		private modal: ModalService,
		private n7rApi: N7rApiService,
		private cdr: ChangeDetectorRef
	) {
		this.current = 0;
		this.autoPlay();
	}

	now = new Date().getTime();
	current: number;
	clear: any;
	imgs = ['/assets/image/n7r/banner/01.png', '/assets/image/n7r/banner/02.png'];
	preOrder(type: number): void {
		this.n7rApi.goodsList().subscribe(good => {
			this.modal.open(N7rGoodDetail, { type, good })
		})

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
						: index === this.imgs.length - 1
							? 'prev'
							: 'off';
			} else if (this.current === this.imgs.length - 1) {
				return index === this.imgs.length - 1
					? 'on'
					: index === this.imgs.length - 2
						? 'prev'
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
				default:
					return 'off';
			}
		} else {
			return 'off';
		}
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

	toPlay(type: number): void {
		this.modal.open(N7rPlay, type);
	}

	is_active(index: number) {
		return index == this.current;
	}

	//下标切换
	changeSmall(index: number) {
		this.current = index;
	}


	goto(): void {
		this.content.nativeElement.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}
}
