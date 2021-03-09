import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable, BehaviorSubject } from 'rxjs';
import { Select } from '@ngxs/store';
import { UserState } from '../state/user.state';

@Injectable()
export class CustomerService {
	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	constructor(private http: HttpClient) { }

	unreadCounnt$ = new BehaviorSubject(0);

	count(): void {
		this.isLogin$.subscribe(is => {
			if (is) {
				timer(0, 10000).subscribe(_t => {
					this.http.get<{ count: number }>('/webim/unread_count').subscribe(l => {
						this.unreadCounnt$.next(l.count);
					});
				});
			}
		});
	}
}
