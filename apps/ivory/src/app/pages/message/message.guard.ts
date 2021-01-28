import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

@Injectable()
export class MessageResolve implements CanActivate {

    constructor(private store: Store, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> {
        return this.store.selectOnce<number>(s => s.user.id).pipe(map(
            id => {
                if (id > 0) {
                    return true;
                } else {
                    return this.router.parseUrl('/passport/login');
                }
            }
        ));
    }
}
