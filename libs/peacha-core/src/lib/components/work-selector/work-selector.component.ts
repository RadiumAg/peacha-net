import { switchMap, map, startWith, debounceTime, takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { UserState } from './../../core/state/user.state';
import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, combineLatest, EMPTY, of, BehaviorSubject, Subscription } from 'rxjs';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { ModalRef } from '../../core/service/modals.service';
import { MODAL_DATA_TOKEN } from '../../core/tokens';

type Work = {
	id: number;
	cover: string;
	name: string;
	like_count: number;
	collect_count: number;
	comment_count: number;
	price: number;
	type: number;
	publishtime: string;
	description: string;
	state: number;
};

type Works = {
	count: number;
	list: Work[];
};

@Component({
	selector: 'ivo-work-selector',
	templateUrl: './work-selector.component.html',
	styleUrls: ['./work-selector.component.less'],
})
export class WorkSelectorComponent implements OnInit {
	@Select(UserState.id)
	id$!: Observable<number>;

	page = 0;

	works$ = new BehaviorSubject({
		count: 0,
		list: [],
	});

	workSub: Subscription;

	constructor(
		private modalRef: ModalRef<WorkSelectorComponent>,
		@Inject(MODAL_DATA_TOKEN)
		private token: {
			type: 'ill' | 'live2d' | 'all';
			exclouds: number[];
		},
		private http: HttpClient,
		private scrollDispatcher: ScrollDispatcher,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.search('');
	}

	select(work: Work) {
		this.modalRef.close(work);
	}

	search(keyword: string) {
		this.works$.next({
			count: 0,
			list: [],
		});
		this.page = 0;
		this.workSub?.unsubscribe();
		this.workSub = combineLatest([
			this.id$,
			this.scrollDispatcher.scrolled().pipe(
				switchMap(scrollable => {
					if (scrollable) {
						const scroll = scrollable as CdkScrollable;
						if (scroll.measureScrollOffset('bottom') === 0) {
							return of((++this.page).toString());
						}
					}
					return EMPTY;
				}),
				startWith('0'),
				debounceTime(100)
			),
		])
			.pipe(
				takeWhile(() => this.works$.value.list.length < this.works$.value.count || this.works$.value.count === 0),
				switchMap(([id, page]) =>
					this.http
						.get<Works>(`/work/get_works`, {
							params: {
								u: id.toString(),
								p: page || '0',
								k: keyword,
								s: '12',
								ws: '-1',
								c: this.token.type === 'ill' ? '1' : this.token.type === 'live2d' ? '0' : '-1',
							},
						})
						.pipe(
							map(works => {
								this.cdr.markForCheck();
								this.works$.next({
									...works,
									list: [
										...this.works$.value.list,
										...works.list.filter(work => !this.token.exclouds?.includes(work.id)),
									],
								});
								this.cdr.detectChanges();
							})
						)
				)
			)
			.subscribe();
	}

	close() {
		this.modalRef.close();
	}
}
