import { animate, state, style, transition, trigger } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { ModalService, UserState } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { BehaviorSubject } from 'rxjs';
import { N7rGoodDetail } from './components/good-detail/good-detail';
import { N7rPlay } from './components/play/play';
import { N7rApiService } from './n7r-api.service';

type Good = {
	id: number;
	price: number;
	discountAmount: number;
	name: string;
	description: string;
	stock: number;
	salesVolumes: number;
	cover: string;
	month: number;
};

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
export class N7rPage {
	@Select(UserState.isLogin)
	isLogin$: BehaviorSubject<boolean>;

	@ViewChild('detail') content: ElementRef;

	constructor(
		private modal: ModalService,
		private n7rApi: N7rApiService,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private http: HttpClient
	) {
		this.current = 0;
		this.autoPlay();
		this.n7rApi.goodsList().subscribe(good => {
			this.allGoods = good;
			this.indexGood = good.list[0];
			this.singleInfo = good.list.filter(l => Number(l.id) === 1145141007);
			this.suitInfo = good.list.filter(l => Number(l.id) === 1145141006);
		});
	}

	count$ = new BehaviorSubject(1);

	indexChoice = 0;
	indexGood: Good;

	now = new Date().getTime();
	current: number;
	clear: any;
	imgs = [
		'/assets/image/n7r/banner/03.png',
		'/assets/image/n7r/banner/04.png',
		'/assets/image/n7r/banner/01.png',
		'/assets/image/n7r/banner/02.png',
	];
	news = [
		{ link: 'https://www.n7r.com.cn/nd.jsp?id=7', title: 'Tundra Tracker：比VIVE Tracker更轻更小更强大' },
		{
			link: 'https://www.n7r.com.cn/nd.jsp?id=5',
			title: 'Exclusive: Tundra Tracker Aims for Smaller, Cheaper Alternative to Vive Tracker for SteamVR Tracking',
		},
		{ link: 'https://www.n7r.com.cn/nd.jsp?id=2', title: 'Valve 预告今年推出SteamVR 2.0 ' },
		{ link: 'https://www.n7r.com.cn/nd.jsp?id=3', title: 'Lighthouse + Vive Tracker 的追踪有多牛？牛到可以在 VR 里玩杂耍' },
		{ link: 'https://www.n7r.com.cn/nd.jsp?id=1', title: '最大支持16个2.0基站串联，Steam最新更新让大空间成本降低数十倍！' },
		{ link: 'https://www.n7r.com.cn/nd.jsp?id=4', title: 'CES2020：概念产品走进生活' },
	];
	allGoods: { list: Good[] };
	suitInfo: any = [];
	singleInfo: any = [];

	isZaoniao = false;

	preOrder(stock: number): void {
		this.isLogin$.subscribe(is => {
			if (is) {
				if (stock > 0 && stock >= this.count$.value) {
					if (this.indexChoice == this.allGoods.list.length - 1) {
						this.http.get(`/advance/check_order`).subscribe(
							_ => {
								this.modal.open(N7rGoodDetail, { type: this.isZaoniao, good: this.indexGood });
							},
							e => {
								if (e.code === 403) {
									this.modal.open(PopTips, ['需购买动捕套餐后才可购买单个追踪器', false]);
								} else if (e.code === 20000) {
									this.modal.open(PopTips, ['库存不足无法购买', false]);
								}
							}
						);
					} else {
						this.modal.open(N7rGoodDetail, { type: this.isZaoniao, good: this.indexGood });
					}
				} else {
					this.modal.open(PopTips, ['库存不足无法购买', false]);
				}
			} else {
				this.router.navigate(['login'], {
					queryParams: {
						return: 'n7r',
					},
				});
			}
		});
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

	select(item: Good, index: number): void {
		this.indexGood = item;
		this.indexChoice = index;
		this.isZaoniao = index === this.allGoods.list.length - 1;
	}
}
