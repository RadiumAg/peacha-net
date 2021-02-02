import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'ivo-userinfo',
	templateUrl: './userinfo.component.html',
	styleUrls: ['./userinfo.component.less'],
})
export class UserinfoComponent {
	@Input() user: {
		id: number;
		nickname: string;
		description: string;
		avatar: string;
		follow_state: number;
	};

	constructor(private router: Router) { }

	toUser(id: number) {
		this.router.navigate(['user', id]);
	}
}
