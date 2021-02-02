import { Component, ViewChild, ElementRef, TemplateRef, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

type HotGood = {
	count: number;
	list: {
		id: number;
		name: string;
		like_count: number;
		cover: string;
		category: number;
		price: number;
		userid: number;
		nickname: string;
	}[];
};
@Component({
	selector: 'ivo-hot-good',
	templateUrl: './hot-good.page.html',
	styleUrls: ['../reuse.less'],
})
export class HotGoodPage {
	@ViewChild('order') orderE: ElementRef;
	@ViewChild('filter') filterE: ElementRef;
	@ViewChild('overlayOne') overlayOne: TemplateRef<any>;
	@ViewChild('overlayTwo') overlayTwo: TemplateRef<any>;

	currentPage$ = new BehaviorSubject<number>(1);
	worksList: Array<any> = [];

	order: FormControl = new FormControl(6);
	time: FormControl = new FormControl(0);
	count: FormControl = new FormControl(-1);

	order$ = this.order.valueChanges
		.pipe(
			tap(or => {
				this.router.navigate([], {
					queryParams: {
						o: or,
					},
					queryParamsHandling: 'merge',
				});
			})
		)
		.subscribe();

	time$ = this.time.valueChanges
		.pipe(
			tap(dd => {
				this.router.navigate([], {
					queryParams: {
						dd: dd,
					},
					queryParamsHandling: 'merge',
				});
			})
		)
		.subscribe();
	count$ = this.count.valueChanges
		.pipe(
			tap(st => {
				this.router.navigate([], {
					queryParams: {
						ss: st,
					},
					queryParamsHandling: 'merge',
				});
			})
		)
		.subscribe();

	/**热门商品 */
	hotGoods$ = this.route.queryParams.pipe(
		switchMap(params => {
			return this.http.get<HotGood>(`/work/hot_goods?k=&p=${params.page - 1 ?? 0}&s=20`).pipe(
				tap(() => {
					this.currentPage$.next(params.page ?? 1);
				}),
				catchError(() => {
					return of({
						count: 0,
						list: [],
					});
				})
			);
		})
	);
	constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

	toPage(p: number) {
		this.router.navigate([], {
			queryParams: {
				page: p,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}

	toUser(id: number) {
		this.router.navigate(['user', id]);
	}
}
