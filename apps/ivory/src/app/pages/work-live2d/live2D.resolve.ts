import { Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { EMPTY } from 'rxjs';
import { IvoryError, WorkDetail } from '@peacha-core';


@Injectable()
export class Live2DResolve implements Resolve<any> {
	constructor(private http: HttpClient, private router: Router) { }

	resolve(route: import('@angular/router').ActivatedRouteSnapshot) {
		const id = route.params.id;
		return this.http.get<WorkDetail>(`/work/get_work?w=${id}`).pipe(
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
