import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { withLatestFrom, switchMap, tap } from 'rxjs/operators';

type Detail = {
	id: number;
	news_type: number;
	source_id: number;
	details: string;
	public_time: string;
	public_userid: number;
	public_username: string;
	public_useravatar: string;
	tip: string;
	work: string;
	one: string;
	two: string;
	catenation: string;
};

@Component({
	selector: 'ivo-receive-like',
	templateUrl: './receive-like.page.html',
	styleUrls: ['./receive-like.page.less'],
})
export class ReceiveLikePage implements OnDestroy {
	likeCount$ = new BehaviorSubject(null);
	likeList: Array<Detail> = [];
	page$ = new BehaviorSubject<number>(0);

	constructor(
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private modal: ModalService,
		private scrollDispatcher: ScrollDispatcher
	) { }

	receiveLike$ = this.page$
		.pipe(
			withLatestFrom(this.likeCount$),
			switchMap(([p, c]) => {
				if (c === 10 || p === 0) {
					return this.http.get<{ list: Detail[] }>(`/news/star?page=${p}&size=10`).pipe(
						tap(s => {
							this.likeCount$.next(s.list.length);
							s.list.map(l => {
								switch (l.news_type) {
									case 300:
										l.one = l.details?.split('{')[0];
										l.two = l.details?.split('>')[1]?.split('}')[0];
										break;
									case 200:
										l.one = l.details?.split('《')[0];
										l.two = '《' + l.details?.split('>')[1]?.split('}')[0] + '》';
										break;
								}
								l.catenation = l.details?.split('@')[1].split('>')[0];
								this.likeList.push(l);
							});
							this.cdr.detectChanges();
						})
					);
				}
				return EMPTY;
			})
		)
		.subscribe();

	scroll$ = this.scrollDispatcher
		.scrolled()
		.pipe(
			tap(scrollable => {
				if (scrollable) {
					const scroll = scrollable as CdkScrollable;
					if (scroll.measureScrollOffset('bottom') <= 0) {
						if (this.likeCount$.value === 10) {
							this.page$.next(this.page$.value + 1);
						}
					}
				}
			})
		)
		.subscribe();

	toDetail(url: string, id: string): void {
		this.http.get<{ rootid: number; root_index: number; sub_index: number }>(`/comment/reply_jump?c=${id}`).subscribe(s => {
			if (s.root_index != -1) {
				window.open(`${url}?root=${s.root_index}&sub=${s.sub_index}&rootid=${s.rootid}#${'reply' + id}`);
			} else {
				this.modal.open(PopTips, ['该评论不存在', false]);
			}
		});
	}

	ngOnDestroy(): void {
		this.scroll$.unsubscribe();
	}
}
