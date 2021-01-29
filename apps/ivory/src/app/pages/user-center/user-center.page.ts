import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { UserState } from '@peacha-core';
import { Observable } from 'rxjs';

@Component({
	selector: 'ivo-user-center',
	templateUrl: './user-center.page.html',
	styleUrls: ['./user-center.page.less'],
})
export class UserCenterPage implements OnInit {
	@Select(UserState.avatar)
	avatar$: Observable<string>;

	@Select(UserState.nickname)
	nickname$: Observable<string>;

	@Select(UserState.description)
	description$: Observable<string>;

	@Select(UserState.role)
	role$: Observable<Array<{ id: number; expiry: number }>>;

	userRole: Array<number> = [];

	constructor() {}

	ngOnInit(): void {
		this.role$.subscribe(s => {
			s?.forEach(l => {
				this.userRole.push(l.id);
			});
		});
	}
}
