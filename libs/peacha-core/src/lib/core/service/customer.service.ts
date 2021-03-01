import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { timer, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { UserState } from '../state/user.state';

@Injectable()
export class CustomerService {
	@Select(UserState.isLogin)
	isLogin$: Observable<boolean>;

	constructor(private http: HttpClient) { }

	unreadCounnt = 0;

	count(): void {
		this.isLogin$.subscribe(is => {
			if (is) {
				timer(1000, 60000).subscribe(_t => {
					this.http.get<{ count: number }>('/webim/unread_count').subscribe(l => {
						this.unreadCounnt = l.count;
					});
				});
			}
		});
	}
}
