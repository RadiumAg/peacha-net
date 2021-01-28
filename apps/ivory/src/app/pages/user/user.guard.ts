import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private store: Store, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.store
      .selectOnce<number>((s) => s.user.id)
      .pipe(
        map((uid) => {
          if (route.params.id != undefined && /^\d+$/.test(route.params.id)) {
            return true;
          } else if (uid > 0) {
            return this.router.parseUrl('/user/' + uid);
          } else {
            return this.router.parseUrl('/passport/login');
          }
        })
      );
  }
}
