import { Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { OpalUser, IvoryError } from '@peacha-core';

@Injectable()
export class UserResolve implements Resolve<any> {
	constructor(private http: HttpClient, private store: Store, private router: Router) {}

	resolve(route: import('@angular/router').ActivatedRouteSnapshot, state: import('@angular/router').RouterStateSnapshot) {
		let id = route.params.id;
		if (id === '') {
			id = this.store.selectSnapshot(s => s.user.id);
		}
		return this.http.get<OpalUser>(`/user/get_user?i=${id}`).pipe(
			catchError((s: IvoryError) => {
				//console.log(s);
				if (s.code == 101) {
					this.router.navigateByUrl('404', { skipLocationChange: true });
				}
				return EMPTY;
			})
		);
	}
}
