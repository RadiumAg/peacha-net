import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of, EMPTY } from 'rxjs';
import { switchMap, tap, catchError, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'ivo-store',
	templateUrl: './store.page.html',
	styleUrls: ['./store.page.less'],
})
export class StorePage implements AfterViewInit {
	constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private render: Renderer2) { }

	workCount$ = new BehaviorSubject(0);
	workId$ = new BehaviorSubject(0);
	page$ = new BehaviorSubject(1);

	params$ = this.route.queryParams.subscribe(r => {
		if (r.id && r.id != this.workId$.value) {
			this.workId$.next(r.id);
		}
		if (r.p && r.p != this.page$.value) {
			this.page$.next(r.p);
		}
	});

	works$: Observable<{
		count: number;
		list: {
			id: number;
			cover: string;
			name: number;
			createTime: string;
			price: number;
			category: number;
		}[];
	}> = this.page$.pipe(
		switchMap(r => {
			if (r) {
				return this.http.get<{
					count: number;
					list: {
						id: number;
						cover: string;
						name: number;
						createTime: string;
						price: number;
						category: number;
					}[];
				}>(`/work/get_own_works?p=${r ? r - 1 : 0}&s=6`).pipe(
					tap(s => {
						this.workCount$.next(s.count);
					})
				);
			} else {
				return EMPTY;
			}

		})
	);

	item$ = combineLatest([this.workId$, this.works$]).pipe(
		switchMap(([id, w]) => {
			return this.http.get<{
				id: number,
				cover: string,
				name: string,
				category: number,
				sellerId: number,
				sellerName: string,
				fileSize: number,
				goods: {
					id: number,
					name: string,
					createTime: number,
					maxStock: number,
					fileSize: number,
					price: number
				}
			}>(`/work/get_own_work_detail?w=${id == 0 ? w.list[0].id : id}`);
		}),
		catchError(_e => {
			return of({ count: 0 });
		})
	);

	@ViewChild('bgc')
	bgc: ElementRef;

	ngAfterViewInit(): void {
		const timer = setInterval(() => {
			if (this.bgc?.nativeElement) {
				this.render.setStyle(this.bgc.nativeElement, 'height', window.innerHeight - 106 + 'px');
				clearInterval(timer);
			}
		}, 1);
	}

	page(data: number) {
		this.router.navigate([], {
			queryParams: {
				p: data,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}
	selectOne(id: number) {
		this.router.navigate([], {
			queryParams: {
				id,
			},
			queryParamsHandling: 'merge',
		});
	}
	download(id: number) {
		this.http
			.post('/work/download_goods', {
				g: id
			})
			.subscribe((s: any) => {
				window.open(s.url);
			});
	}

	toWork(id: number, c: number) {
		if (c == 1) {
			this.router.navigate(['illust', id]);
		} else {
			this.router.navigate(['live2d', id]);
		}
	}
}
