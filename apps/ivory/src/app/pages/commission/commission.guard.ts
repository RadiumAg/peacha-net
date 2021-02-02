import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CommissionGuard implements CanActivate {
	constructor(private router: Router, private store: Store) { }
	canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		return this.store
			.selectOnce<number>(s => s.user.id)
			.pipe(
				map(id => {
					if (id > 0) {
						// if (next.queryParams.c === undefined) {
						//     this.router.navigate(['commission'], {
						//         queryParams: { c: -1 },
						//         queryParamsHandling: 'merge',
						//     });
						//     return false;
						// }
						return true;
					} else {
						this.router.navigate(['login'], {
							queryParams: {
								return: 'commission',
							},
						});
						return true;
					}
				})
			);
	}
}
