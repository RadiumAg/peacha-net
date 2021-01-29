import { Component } from '@angular/core';
import { take, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { timer } from 'rxjs';

@Component({
	selector: 'ivo-authentication-wait',
	templateUrl: './authentication-wait.page.html',
	styleUrls: ['./authentication-wait.page.less'],
})
export class AuthenticationWaitPage {
	constructor(private router: Router) {}

	timer$ = timer(0, 1000).pipe(
		take(6),
		map(i => {
			if (i < 5) {
				return 5 - i;
			} else {
				this.router.navigate(['/setting/security']);
				return 0;
			}
		})
	);
}
