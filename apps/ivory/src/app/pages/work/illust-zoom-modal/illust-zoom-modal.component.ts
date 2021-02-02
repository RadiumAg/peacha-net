import { Component, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { ModalRef, MODAL_ANIMATION, MODAL_DATA_TOKEN } from '@peacha-core';
import { BehaviorSubject } from 'rxjs';

enum ZoomInOrOut {
	in,
	out,
}
@Component({
	selector: 'ivo-illust-zoom-modal',
	templateUrl: './illust-zoom-modal.component.html',
	styleUrls: ['./illust-zoom-modal.component.less'],
	animations: [MODAL_ANIMATION],
})
export class IllustZoomModalComponent implements AfterViewInit, OnDestroy {
	@ViewChild('ill')
	img: ElementRef;

	@ViewChild('tips', { static: false })
	tips: ElementRef<any>;

	mouse = {
		start: { x: 0, y: 0, oldLeft: 0, oldTop: 0 },
	};

	readonly imgConfig = {
		transform: 'translate(-50%,-50%) scale(1)',
		left: '50%',
		top: '50%',
	};

	private regex = /(scale)\(([0-9]|([0-9]\.[0-9]))\)/gi;

	/**
	 *
	 * @description 策略对象，根据%还是px自动计算
	 * @private
	 * @memberof IllustZoomModalComponent
	 */
	private readonly getOldLeftAndTop = {
		// eslint-disable-next-line no-global-assign
		target: (HTMLElement = null),
		getter: {
			getLeft(_target: HTMLElement): number {
				return 1;
			},
			getTop(_target: HTMLElement): number {
				return 1;
			},
		},
		getPx: {
			getLeft(target: HTMLElement): number {
				return Number(target.style.left.replace('px', ''));
			},
			getTop(target: HTMLElement): number {
				return Number(target.style.top.replace('px', ''));
			},
		},
		getPrecent: {
			getLeft: (target: HTMLElement): number => {
				const el = this.el.nativeElement as HTMLElement;
				return (Number(target.style.left.replace('%', '')) / 100) * el.clientWidth;
			},
			getTop: (target: HTMLElement): number => {
				const el = this.el.nativeElement as HTMLElement;
				return (Number(target.style.top.replace('%', '')) / 100) * el.clientHeight;
			},
		},
		init(target: HTMLElement) {
			this.target = target;
			if (target.style.left.includes('%')) {
				this.getter = this.getPrecent;
			} else {
				this.getter = this.getPx;
			}
			return this;
		},
		getleft(): number {
			return this.getter.getLeft(this.target);
		},
		getTop(): number {
			return this.getter.getTop(this.target);
		},
	};

	pic$ = new BehaviorSubject('');

	tipTimer: NodeJS.Timer;

	constructor(
		private modalRef: ModalRef<IllustZoomModalComponent>,
		@Inject(MODAL_DATA_TOKEN)
		public pics: {
			assets: string[];
			index: number;
		},
		private el: ElementRef
	) {
		this.closeTips();
	}

	/**
	 * @description 点击阴影关闭
	 */
	@HostListener('click', ['$event'])
	dropClick(e: Event) {
		console.log();
		if (!(e.target instanceof HTMLImageElement)) {
			this.modalRef.close();
		}
	}

	modalClose() {
		this.modalRef.close();
	}

	previous() {
		if (this.pics.index > 0) {
			this.pics.index -= 1;
			this.refreshImg();
		}
	}

	next() {
		if (this.pics.index < this.pics.assets.length - 1) {
			this.pics.index += 1;
			this.refreshImg();
		}
	}

	show(index: number) {
		this.pics.index = index;
	}

	/**
	 * @description 放大图片缩小图片方法
	 * @param config  配置对象
	 */
	scaleImg(config: { target: HTMLElement; regex: RegExp; step: number; max?: number; min?: number; scale: ZoomInOrOut }) {
		const oldScale = Number(config.target.style.transform.match(this.regex)[0].replace('scale(', '').replace(')', ''));
		if (config.scale) {
			if (oldScale <= config.max - 0.1) {
				config.target.style.transform =
					config.target.style.transform.replace(config.regex, '') + `scale(${oldScale + config.step + ''})`;
			} else {
				config.target.style.transform = config.target.style.transform.replace(config.regex, '') + `scale(${config.max})`;
			}
		} else {
			if (oldScale >= config.min + config.step) {
				config.target.style.transform =
					config.target.style.transform.replace(config.regex, '') + `scale(${oldScale - config.step + ''})`;
			} else {
				config.target.style.transform = config.target.style.transform.replace(config.regex, '') + `scale(${config.min})`;
			}
		}
	}

	private zoomIn(targetElement: HTMLElement) {
		this.scaleImg({
			target: targetElement,
			regex: this.regex,
			step: 0.1,
			min: 0.1,
			scale: ZoomInOrOut.in,
		});
	}

	private zoomOut(targetElement: HTMLElement) {
		this.scaleImg({
			target: targetElement,
			regex: this.regex,
			step: 0.1,
			max: 4,
			scale: ZoomInOrOut.out,
		});
	}

	mouseWeel = (e: WheelEvent) => {
		e.preventDefault();
		const targetElement = this.img.nativeElement as HTMLElement;
		if (e.deltaY >= 0) {
			this.zoomIn(targetElement);
		} else if (e.deltaY < 0) {
			this.zoomOut(targetElement);
		}
	};

	close = (e: KeyboardEvent) => {
		if (e.which === 27) {
			this.modalRef.close('');
		}
	};

	draggleend = (e: MouseEvent) => {
		(this.el.nativeElement as HTMLElement).removeEventListener('mousemove', this.draggle, true);
		e.preventDefault();
	};

	draggleout = (_e: MouseEvent) => {
		(this.el.nativeElement as HTMLElement).removeEventListener('mousemove', this.draggle, true);
	};

	draggle = (ev: MouseEvent) => {
		(this.img.nativeElement as HTMLElement).style.left = this.mouse.start.oldLeft + (ev.pageX - this.mouse.start.x) + 'px';
		(this.img.nativeElement as HTMLElement).style.top = this.mouse.start.oldTop + (ev.pageY - this.mouse.start.y) + 'px';
	};

	dragglestart = (e: MouseEvent) => {
		const img = this.img.nativeElement as HTMLElement;
		this.mouse.start.x = e.pageX;
		this.mouse.start.y = e.pageY;
		this.mouse.start.oldTop = this.getOldLeftAndTop.init(img).getTop();
		this.mouse.start.oldLeft = this.getOldLeftAndTop.init(img).getleft();

		if (e.button === 0) {
			(this.el.nativeElement as HTMLElement).addEventListener('mousemove', this.draggle, true);
		}

		e.preventDefault();
	};

	refreshImg() {
		const img = this.img.nativeElement as HTMLElement;
		img.style.transform = this.imgConfig.transform;
		img.style.left = this.imgConfig.left;
		img.style.top = this.imgConfig.top;
	}

	private bind() {
		const img = this.img.nativeElement as HTMLElement;
		img.addEventListener('mousedown', this.dragglestart, true);
		img.addEventListener('mouseup', this.draggleend, true);
		img.addEventListener('mouseout', this.draggleout, true);
		img.addEventListener('wheel', this.mouseWeel, { passive: false });
		window.addEventListener('keydown', this.close, true);
	}

	private unBind() {
		const img = this.img.nativeElement as HTMLElement;
		img.removeEventListener('mousedown', this.dragglestart, true);
		img.removeEventListener('mouseup', this.draggleend, true);
		img.removeEventListener('mouseout', this.draggleout, true);
		img.removeEventListener('wheel', this.mouseWeel);
		window.removeEventListener('keydown', this.close, true);
	}

	private closeTips() {
		clearInterval(this.tipTimer);
		this.tipTimer = setInterval(() => {
			(this.tips.nativeElement as HTMLElement).style.opacity = '0';
		}, 5000);
	}

	ngAfterViewInit(): void {
		this.bind();
	}

	ngOnDestroy(): void {
		this.unBind();
	}
}
