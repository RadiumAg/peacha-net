import { Component, ViewChild, ElementRef } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState, CustomerService, MessageUnreadCountService } from '@peacha-core';
import { ChatState } from '@peacha-core/state';
import { Observable, BehaviorSubject } from 'rxjs';


@Component({
	selector: 'ivo-message',
	templateUrl: './message.page.html',
	styleUrls: ['./message.page.less'],
})
export class MessagePage {
	@ViewChild('all') all: ElementRef;
	@ViewChild('nav') nav: ElementRef;
	@ViewChild('router') router: ElementRef;

	@Select(UserState.id)
	id$: Observable<number>;

	@Select(ChatState.unread)
	chatUnread$: BehaviorSubject<number>;

	unread$ = new BehaviorSubject(this.customer.unreadCounnt);
	notice$ = this.msgCount.systemCount$;
	star$ = this.msgCount.likeCount$;
	forum$ = this.msgCount.replyCount$;
	bulletin$ = this.msgCount.bulletinCount$;
	cooperation$ = new BehaviorSubject(0);
	constructor(private customer: CustomerService, private msgCount: MessageUnreadCountService) {
		// this.http
		// 	.get<{
		// 		newest: number;
		// 		notice: number;
		// 		star: number;
		// 		forum: number;
		// 		follow: number;
		// 		cooperation: number;
		// 	}>('/news/count')
		// 	.subscribe(s => {
		// 	});
		// this.msgApi.getUnreadCount(['peacha0', 'peacha1', 'peacha2'])
		// 	.subscribe(s => {
		// 		if (s.list.length > 0) {
		// 			this.notice$.next(s.list.filter(l => l.platform === 'peacha2')[0]?.count)
		// 			this.star$.next(s.list.filter(l => l.platform === 'peacha1')[0]?.count);
		// 			this.forum$.next(s.list.filter(l => l.platform === 'peacha0')[0]?.count);
		// 		}

		// 	});
	}

	toMO(): void {
		this.forum$.next(0);
	}
	toMT(): void {
		this.star$.next(0);
	}
	toMTr(): void {
		this.notice$.next(0);
	}
	toMF(): void {
		this.cooperation$.next(0);
	}

	remove(): void {
		this.unread$.next(0);
	}
}
