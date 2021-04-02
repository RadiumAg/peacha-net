import { Component, HostListener, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { IndexApiService } from '../index-api.service';


@Component({
	selector: 'ivo-login-index',
	templateUrl: './login-index.page.html',
	styleUrls: ['./login-index.page.less'],
})
export class LoginIndexPage {
	constructor(
		private indexApi: IndexApiService,
		private router: Router,
		private render: Renderer2
	) { }

	loadOne = true;
	loadTwo = true;
	loadThree = true;
	loadFour = true;
	loadFive = true;
	loadSix = true;
	loadBanner = true;

	curRecommendWorkPart = 0;

	@ViewChild('show') show: ElementRef;

	/**banner图片 */
	banners$ = this.indexApi.getIndexBanner().pipe(
		tap(() => {
			this.loadBanner = false;
		}),
		catchError(() => {
			return of({
				name: '',
				imageurl: '',
				url: '',
			});
		})
	);

	/**最新作品动态 */
	newest$ = this.indexApi.getNewest(0, 5, '', -1, new Date().getTime()).pipe(
		catchError(() => {
			return of({
				count: 0,
				list: [],
			});
		})
	);

	changeOriginalWork$ = new BehaviorSubject<number>(0);
	changeLiveWork$ = new BehaviorSubject<number>(0);
	changeHotUser$ = new BehaviorSubject<number>(0);

	/**热门标签 */
	hotTags$ = this.indexApi.getHotTag().pipe(
		tap(() => {
			this.loadFour = false;
		})
	);
	/**热门全部作品 */
	hotlWork$ = this.changeOriginalWork$.pipe(
		switchMap(() => {
			return this.indexApi.getRecommendWork().pipe(
				tap(s => {
					console.log(s.list.length);
				})
			);
		}),
		catchError(() => {
			return of({
				count: 0,
			});
		})
	);
	/**热门原画作品 */
	hotOriginalWork$ = this.changeOriginalWork$.pipe(
		switchMap(_ => {
			return this.indexApi.getHotWork(0, 10, 1, 0).pipe(
				tap(_s => {
					this.loadOne = false;
				})
			);
		}),
		catchError(_e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);
	/**热门作品 */
	hotLiveWork$ = this.changeLiveWork$.pipe(
		switchMap(_ => {
			return this.indexApi.getHotWork(0, 10, 0, 0).pipe(
				tap(_s => {
					this.loadTwo = false;
				})
			);
		}),
		catchError(_e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);
	/**公示期作品 */
	publicWork$ = this.indexApi.getPublicWork(0, 5).pipe(
		tap(_s => {
			this.loadThree = false;
		}),
		catchError(_e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);
	/**热门作者 */
	hotUser$ = this.changeHotUser$.pipe(
		switchMap(_s => {
			return this.indexApi.getHotUser(0, 4).pipe(
				tap(() => {
					this.loadFive = false;
				})
			);
		}),
		catchError(_e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);
	/**热门商品 */
	hotGoods$ = this.indexApi.getHotWork(0, 10, -1, 1).pipe(
		tap(_s => {
			this.loadSix = false;
		}),
		catchError(_e => {
			return of({
				count: 0,
				list: [],
			});
		})
	);
	@ViewChild('go', { read: ElementRef })
	private go: ElementRef<any>;
	private upSvg: Document;
	private animateTransforms: any;
	private sets: any;
	private svg: SVGElement;
	private isScrolled = false;

	iframeInit() {
		this.upSvg = (this.go.nativeElement as HTMLIFrameElement).getSVGDocument();
		this.animateTransforms = this.upSvg.getElementsByTagName('animateTransform') as any;

		this.sets = this.upSvg.getElementsByTagName('set') as any;
		this.svg = this.upSvg.getElementsByTagName('svg')[0];
		this.addListener();
	}

	/**
	 *  @description 添加监听
	 */
	private addListener() {
		const toTop = () => {
			this.isScrolled = true;
			document.scrollingElement.scrollTo({
				behavior: 'smooth',
				top: 0,
			});
		};
		this.svg.addEventListener('click', toTop, true);
		document.addEventListener(
			'wheel',
			(e: Event) => {
				if (this.isScrolled) {
					e.preventDefault();
					return false;
				}
			},
			{ passive: false }
		);
		this.upSvg.addEventListener(
			'wheel',
			(e: WheelEvent) => {
				if (this.isScrolled) {
					e.preventDefault();
					return false;
				}
			},
			{ passive: false }
		);
	}

	@HostListener('window:scroll', ['$event'])
	public scrolled(_$event: Event) {
		if (document.documentElement.scrollTop >= 900) {
			this.render.setStyle(this.show.nativeElement, 'visibility', 'visible');
		} else if (document.documentElement.scrollTop <= 900) {
			if (this.isScrolled && document.documentElement.scrollTop === 0) {
				if (this.animateTransforms) {
					for (const item of this.animateTransforms) {
						item.endElement();
					}
				}
				if (this.sets) {
					for (const item of this.sets) {
						item.endElement();
					}
				}
				this.render.setStyle(this.show.nativeElement, 'visibility', 'hidden');
				this.isScrolled = false;
			}
			if (!this.isScrolled) {
				this.render.setStyle(this.show.nativeElement, 'visibility', 'hidden');
			}
		}
	}

	@HostListener('wheel', ['$event']) public whell(_$event: Event) { }

	toDetail(i: number) {
		this.router.navigate(['rankling'], {
			queryParams: {
				a: i,
			},
		});
	}

	toNewest() {
		this.router.navigate(['newestWork']);
	}
	toOriginalWork() {
		this.router.navigate(['hotOriginalWork']);
	}
	toLive2DWork() {
		this.router.navigate(['hotLive2DWork']);
	}
	toDetailPublic() {
		this.router.navigate(['publicWork'], {
			queryParams: {
				page: 1,
			},
		});
	}

	toDetailGood() {
		this.router.navigate(['hotgood'], {
			queryParams: {
				page: 1,
			},
		});
	}

	searchWork(id: number, k: string) {
		this.router.navigate(['hotTagWork'], {
			queryParams: {
				id,
				k,
				page: 1,
			},
		});
	}

}
