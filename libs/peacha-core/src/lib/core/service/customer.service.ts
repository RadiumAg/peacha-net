import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable, BehaviorSubject, Subject } from 'rxjs';
import { Select } from '@ngxs/store';
import { UserState } from '../state/user.state';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

@Injectable()
export class CustomerService {
	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	constructor(private http: HttpClient) {}

	unreadCounnt$ = new BehaviorSubject(0);

	destroy$ = new Subject<void>();

	cancelGetCount() {
		this.destroy$.next();
		this.destroy$.complete();
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	count$ = timer(0, 10000).pipe(
		switchMap(() => {
			return this.http.get<{ count: number }>('/webim/unread_count');
		}),
		tap(s => {
			this.unreadCounnt$.next(s.count);
		}),
		takeUntil(this.destroy$)
	);
}
