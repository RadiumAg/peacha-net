import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class WorkSearchGuard implements CanActivate {
	constructor(private router: Router) { }
	canActivate(
		next: ActivatedRouteSnapshot
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		if (next.queryParams.c === undefined) {
			this.router.navigate(['search'], {
				queryParams: { c: -1, ...next.queryParams },
				queryParamsHandling: 'merge',
			});
			return false;
		}
		if (next.queryParams.p === undefined) {
			this.router.navigate(['search'], {
				queryParams: { p: 1, ...next.queryParams },
				queryParamsHandling: 'merge',
			});
			return false;
		}
		return true;
	}
}
