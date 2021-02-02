import { Component, OnInit, Renderer2, ViewContainerRef, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest, EMPTY, empty } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map, switchMap, tap, take, catchError, withLatestFrom, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Select } from '@ngxs/store';
import { Complain } from './complain/complain';
import { ModalService, DropDownService, UserState, IvoryError } from '@peacha-core';
import { PopTips } from 'libs/peacha-core/src/lib/components/pop-tips/pop-tips';

type Collection = {
	name: string;
	work_count: number;
	create_user_id: number;
	create_user: string;
	createtime: Date;
	cover: string;
	view_state: number;
	like_count: number;
	subcribe_count: number;
	share_count: number;
	is_like: number;
	is_collect: number;
};

type Work = {
	count: number;
	list: {
		id: number;
		cover: string;
		name: string;
		update_time: Date;
		like_count: number;
		collect_count: number;
		state: number;
		price: number;
		type: number;
	};
};

@Component({
	selector: 'ivo-collection-introduce',
	templateUrl: './collection-introduce.page.html',
	styleUrls: ['./collection-introduce.page.less'],
})
export class CollectionIntroducePage implements OnInit {
	get pageUid$() {
		return this.route.parent!.params.pipe(map(s => s.id as number));
	}

	constructor(
		private route: ActivatedRoute,
		private http: HttpClient,
		private renderer: Renderer2,
		private router: Router,
		private view: ViewContainerRef,
		private modal: ModalService,
		private float: DropDownService
	) {}

	@Select(UserState.id)
	id$: Observable<number>;

	@Select(UserState.nickname)
	nickname$: Observable<string>;

	@ViewChild('edit') edit: ElementRef;
	@ViewChild('boardOne') boardOne: TemplateRef<any>;
	@ViewChild('boardTwo') boardTwo: TemplateRef<any>;

	refresh_collection$ = new BehaviorSubject<number>(0);
	selected$ = new BehaviorSubject<Set<number>>(new Set());
	show$ = new BehaviorSubject<boolean>(false);

	collectionId: number;

	collection$: Observable<Collection> = combineLatest(this.route.params, this.refresh_collection$).pipe(
		switchMap(([s]) => {
			return this.http.get<Collection>(`/work/get_collection?c=${s.id}`);
		}),
		shareReplay()
	);

	currentPage$ = new BehaviorSubject<number>(1);

	work$: Observable<Work> = combineLatest(this.route!.params, this.route!.queryParams).pipe(
		switchMap(([w, params]) => {
			this.currentPage$.next(params.page);
			this.collectionId = w.id;
			return this.http.get<any>(`/work/get_collection_works?u=${w.id}&p=${params.page ? params.page - 1 : 0}&s=15`);
		}),
		catchError(e => {
			return of({
				count: 0,
				list: [],
			});
		}),
		tap(s => {
			this.selected$.next(new Set());
		})
	);

	// 修改合辑名称
	isChange: any = true;

	toChange(input: HTMLInputElement) {
		this.isChange = null;
		this.renderer.setStyle(input, 'background', '#ffffff');
	}

	changeName(input: HTMLInputElement) {
		this.renderer.setStyle(input, 'background', '#F7F7F7');
		this.isChange = true;
		combineLatest(this.collection$, this.route.params)
			.pipe(
				take(1),
				switchMap(([c, s]) => {
					if (input.value != c.name) {
						return this.http.post<void>(`/work/update_collection_name`, {
							s: s.id,
							n: input.value,
						});
					} else {
						return empty();
					}
				})
			)
			.subscribe(_ => {
				this.refresh_collection$.next(0);
			});
	}

	show(key: any) {
		this.float.menu(this.edit, key, this.view);
	}

	// 批量操作
	batchUpdate() {
		this.float.close();
		this.collection$
			.pipe(
				take(1),
				tap(c => {
					if (c.work_count == 0) {
						const a = '该合辑暂时没有作品可以批量操作哦！';
						this.modal.open(PopTips, [a, false]);
					} else {
						this.show$.next(true);
					}
				})
			)
			.subscribe(_ => {});
	}

	// 全选
	checkedAll(items: {
		list: Array<{
			id: number;
		}>;
	}) {
		//console.log(items);
		this.selected$
			.pipe(
				take(1),
				map(s => {
					if (s.size === items.list.length) {
						return new Set<number>();
					} else {
						return new Set(items.list.map(u => u.id));
					}
				})
			)
			.subscribe(set => {
				this.selected$.next(set);
			});
	}

	// 返回
	back() {
		this.show$.next(false);
		this.selected$.next(new Set());
	}

	// 单个选择
	checkedWork(id: number) {
		this.selected$
			.pipe(
				take(1),
				map(s => {
					if (s.has(id)) {
						s.delete(id);
						return s;
					} else {
						s.add(id);
						return s;
					}
				})
			)
			.subscribe(set => {
				this.selected$.next(set);
			});
	}

	// 取消收藏作品
	deleteWork() {
		combineLatest([this.route!.params, this.selected$])
			.pipe(
				take(1),
				switchMap(([params, arr]) => {
					return this.http.post<void>('/work/batch_uncollect_work', {
						u: params.id,
						w: [...Array.from(arr)],
					});
				})
			)
			.subscribe(a => {});
	}

	// 删除合辑
	deleteTip() {
		this.float.close();
		const a = '确定要删除该合辑吗？';
		this.modal
			.open(PopTips, [a, true])
			.afterClosed()
			.subscribe(s => {
				if (s === 1) {
				}
			});
	}

	//举报
	toComplain() {
		this.float.close();
		this.modal.open(Complain, this.collectionId);
	}

	toPage(p: number) {
		this.router.navigate([], {
			queryParams: {
				page: p,
			},
			queryParamsHandling: 'merge',
		});
	}

	like() {
		this.route.params
			.pipe(
				take(1),
				switchMap(s => {
					return this.http.post<any>(`/work/like_collection`, {
						c: s.id,
					});
				})
			)
			.subscribe(a => {
				this.refresh_collection$.next(0);
			});
	}

	collect() {
		this.route.params
			.pipe(
				take(1),
				switchMap(s => {
					return this.http.post<void>(`/work/subscribe_collection`, {
						c: s.id,
					});
				}),
				catchError((s: IvoryError) => {
					if (s.code === 127) {
						this.modal.open(PopTips, [s.descrption, false]);
					}
					return EMPTY;
				})
			)
			.subscribe(_ => {
				this.refresh_collection$.next(0);
			});
	}

	share() {}

	open() {
		this.route.params
			.pipe(
				take(1),
				switchMap(s => {
					return this.http.post<void>(`/work/open_collection`, {
						c: s.id,
						s: 0,
					});
				})
			)
			.subscribe(_ => {
				this.refresh_collection$.next(0);
			});
	}

	close() {
		this.route.params
			.pipe(
				take(1),
				switchMap(s => {
					return this.http.post<void>(`/work/open_collection`, {
						c: s.id,
						s: 1,
					});
				})
			)
			.subscribe(_ => {
				this.refresh_collection$.next(0);
			});
	}

	toWork(id: number) {
		this.router.navigate(['work', id]);
	}

	ngOnInit(): void {}
}
