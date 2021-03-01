import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/overlay';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Select } from '@ngxs/store';
import { MessageUnreadCountService, UserState } from '@peacha-core';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { MessageApiService } from '../message-api.service';


@Component({
	selector: 'ivo-receive-reply',
	templateUrl: './receive-reply.page.html',
	styleUrls: ['./receive-reply.page.less'],
})
export class ReceiveReplyPage implements OnDestroy {
	@Select(UserState.avatar)
	useravatar$: Observable<string>;

	pageOne$ = new BehaviorSubject(0);

	constructor(
		private cdr: ChangeDetectorRef,
		private scrollDispatcher: ScrollDispatcher,
		private msgApi: MessageApiService,
		private msgCount: MessageUnreadCountService
	) {
	}

	active$ = new BehaviorSubject(false);
	active = false;
	replyCount$ = new BehaviorSubject(null);
	replyList = [];

	reply$ = this.pageOne$
		.pipe(
			switchMap((p) => {
				return this.msgApi.getQueryList('Peacha0', p, 10).pipe(
					tap(a => {

						this.replyList = this.replyList.concat(a.list);
						if (p === 0) {
							this.replyCount$.next(Number(a.count));
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
								this.msgCount.replyCount$.next(this.msgCount.replyCount$.value - unreadMessage.length);
							})
						}


						this.cdr.detectChanges();
					})
				)

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
						if (this.replyList.length % 10 === 0) {
							this.pageOne$.next(this.pageOne$.value + 1);
						}
					}
				}
			})
		)
		.subscribe();

	reply(): void {
		this.active = true;
	}

	ngOnDestroy(): void {
		this.scroll$.unsubscribe();
	}
}
