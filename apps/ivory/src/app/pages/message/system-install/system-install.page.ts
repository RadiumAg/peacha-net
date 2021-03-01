import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { tap, take } from 'rxjs/operators';
import { MessageApiService } from '../message-api.service';

@Component({
	selector: 'ivo-system-install',
	templateUrl: './system-install.page.html',
	styleUrls: ['./system-install.page.less'],
})
export class SystemInstallPage {
	allTip$ = new BehaviorSubject<boolean>(true);
	two$ = new BehaviorSubject<boolean>(true);
	replyTip$ = new BehaviorSubject<boolean>(true);
	likeTip$ = new BehaviorSubject<boolean>(true);
	systemTip$ = new BehaviorSubject<boolean>(true);

	state$ = this.msgApi.querySetting(['peacha0', 'peacha1', 'peacha2'])
		.pipe(
			tap(s => {
				this.allTip$.next(s.list.filter(l => l.remind === true).length > 0)
				this.replyTip$.next(s.list.filter(l => l.platform === 'peacha0')[0].remind);
				this.likeTip$.next(s.list.filter(l => l.platform === 'peacha1')[0].remind);
				this.systemTip$.next(s.list.filter(l => l.platform === 'peacha2')[0].remind);
			})
		);

	a$ = combineLatest([this.two$, this.replyTip$, this.likeTip$, this.systemTip$]).pipe(
		take(1),
		tap(([two, replyTip, likeTip, systemTip]) => {
			this.msgApi.setup([
				{ platform: 'peacha0', remind: replyTip },
				{ platform: 'peacha1', remind: likeTip },
				{ platform: 'peacha2', remind: systemTip },
			]).subscribe()
		})
	);
	open(i: number): void {
		switch (i) {
			case 1:
				this.allTip$.next(true);
				this.replyTip$.next(true);
				this.likeTip$.next(true);
				this.systemTip$.next(true);
				break;
			case 2:
				this.allTip$.next(false);
				this.replyTip$.next(false);
				this.likeTip$.next(false);
				this.systemTip$.next(false);
				break;
			case 3:
				this.two$.next(true);
				break;
			case 4:
				this.two$.next(false);
				break;
			case 5:
				this.replyTip$.next(true);
				break;
			case 6:
				this.replyTip$.next(false);
				break;
			case 7:
				this.likeTip$.next(true);
				break;
			case 8:
				this.likeTip$.next(false);
				break;
			case 9:
				this.systemTip$.next(true);
				break;
			case 10:
				this.systemTip$.next(false);
				break;
		}
		this.a$.subscribe();
	}

	constructor(
		private msgApi: MessageApiService
	) { }
}
