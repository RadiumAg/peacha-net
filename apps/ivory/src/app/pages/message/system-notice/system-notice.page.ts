import { Component, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { MessageApiService } from '../message-api.service';
import { MessageUnreadCountService } from '@peacha-core';

@Component({
	selector: 'ivo-system-notice',
	templateUrl: './system-notice.page.html',
	styleUrls: ['./system-notice.page.less'],
})
export class SystemNoticePage implements OnDestroy {

	constructor(
		private cdr: ChangeDetectorRef,
		private router: Router,
		private scrollDispatcher: ScrollDispatcher,
		private msgApi: MessageApiService,
		private msgCount: MessageUnreadCountService
	) {

	}

	noticeList = [];
	noticeCount$ = new BehaviorSubject(null);
	page$ = new BehaviorSubject(0);

	notice$ = this.page$
		.pipe(
			switchMap((p) => {
				return this.msgApi.getQueryList('Peacha2', p, 15).pipe(
					tap(s => {
						this.noticeList = this.noticeList.concat(s.list);
						if (p === 0) {
							this.noticeCount$.next(Number(s.count));
						}

						//消息上报已读
						const unreadMessage = s.list.filter(l => l.isRead === false);
						const unreadId = [];
						if (unreadMessage.length > 0) {
							unreadMessage.forEach(x => {
								unreadId.push(x.noticeId)
							})
							this.msgApi.read(unreadId).subscribe(s => {
								console.log(s);
								this.msgCount.systemCount$.next(this.msgCount.systemCount$.value - unreadMessage.length);
							})
						}
						this.cdr.detectChanges();
					})
				);
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
						if (this.noticeList.length % 15 === 0) {
							this.page$.next(this.page$.value + 1);
						}
					}
				}
			})
		)
		.subscribe();

	trackByIndex(index, item): void {
		return index;
	}

	toDetail(link: string): void {
		console.log(link);
		this.router.navigate([encodeURIComponent(link)]);
	}

	ngOnDestroy(): void {
		this.scroll$.unsubscribe();
	}
}


