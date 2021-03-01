import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MessageUnreadCountService, ModalService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { withLatestFrom, switchMap, tap } from 'rxjs/operators';
import { MessageApiService } from '../message-api.service';

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
	likeList = [];
	page$ = new BehaviorSubject<number>(0);


	constructor(
		private http: HttpClient,
		private cdr: ChangeDetectorRef,
		private modal: ModalService,
		private scrollDispatcher: ScrollDispatcher,
		private msgApi: MessageApiService,
		private msgCount: MessageUnreadCountService
	) {
		// this.msgApi.getQueryList('peacha1', 0, 10).subscribe(s => {
		// 	this.testList = s.list;
		// 	this.likeCount$.next(s.count);
		// 	s.list.forEach(l => {
		// 		const a = JSON.parse(l.content);
		// 		console.log(a);
		// 	});
		// 	this.cdr.detectChanges();
		// });
	}

	receiveLike$ = this.page$
		.pipe(
			switchMap((p) => {
				return this.msgApi.getQueryList('Peacha1', p, 10)
					.pipe(
						tap(a => {
							this.likeList = this.likeList.concat(a.list);
							if (p === 0) {
								this.likeCount$.next(Number(a.count));
							}

							//消息上报已读
							const unreadMessage = a.list.filter(l => l.isRead === false);
							const unreadId = [];
							if (unreadMessage.length > 0) {
								unreadMessage.forEach(x => {
									unreadId.push(x.noticeId)
								})
								this.msgApi.read(unreadId).subscribe(s => {
									console.log(s);
									this.msgCount.likeCount$.next(this.msgCount.likeCount$.value - unreadMessage.length);
								})
							}
							this.cdr.detectChanges();
						})
					);

			})
		).subscribe();

	scroll$ = this.scrollDispatcher.scrolled()
		.pipe(
			tap(scrollable => {
				if (scrollable) {
					const scroll = scrollable as CdkScrollable;
					if (scroll.measureScrollOffset('bottom') <= 0) {
						if (this.likeList.length % 10 === 0) {
							this.page$.next(this.page$.value + 1);
						}
					}
				}
			})
		).subscribe();


	toDetail(url: string, id: string): void {
		this.http.get<{ rootid: number, root_index: number, sub_index: number }>(`/comment/reply_jump?c=${id}`)
			.subscribe(s => {
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


