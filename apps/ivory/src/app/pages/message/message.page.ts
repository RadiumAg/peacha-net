import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState, CustomerService } from '@peacha-core';
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
	notice$ = new BehaviorSubject(0);
	star$ = new BehaviorSubject(0);
	forum$ = new BehaviorSubject(0);
	follow$ = new BehaviorSubject(0);
	cooperation$ = new BehaviorSubject(0);
	constructor(private http: HttpClient, private customer: CustomerService) {
		this.http
			.get<{
				newest: number;
				notice: number;
				star: number;
				forum: number;
				follow: number;
				cooperation: number;
			}>('/news/count')
			.subscribe(s => {
				this.notice$.next(s.notice);
				this.star$.next(s.star);
				this.forum$.next(s.forum);
				this.follow$.next(s.follow);
				this.cooperation$.next(s.cooperation);
			});
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
