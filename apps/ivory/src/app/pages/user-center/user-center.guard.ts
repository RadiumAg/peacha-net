import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

@Injectable()
export class SettingResolve implements CanActivate {
	constructor(private store: Store, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
		return this.store
			.selectOnce<number>(s => s.user.id)
			.pipe(
				map(id => {
					if (id > 0) {
						return true;
					} else {
						this.router.navigate(['login'], {
							queryParams: {
								return: (route as any)._routerState.url,
							},
						});
						return true;
					}
				})
			);
	}
}
