import { Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { IvoryError } from '../error';

@Injectable()
export class Live2DResolve implements Resolve<any> {
	constructor(private http: HttpClient, private store: Store, private router: Router) {}

	resolve(route: import('@angular/router').ActivatedRouteSnapshot, state: import('@angular/router').RouterStateSnapshot) {
		let id = route.params.id;
		return this.http.get<any>(`/work/get_work?w=${id}`).pipe(
			tap(a => {
				if (a.category) {
					this.router.navigate(['illust', id]);
					// this.router.navigateByUrl('404', { skipLocationChange: true });
				}
			}),
			catchError((s: IvoryError) => {
				if (s.code == 131) {
					this.router.navigateByUrl('404', { skipLocationChange: true });
				}
				return EMPTY;
			})
		);
	}
}
