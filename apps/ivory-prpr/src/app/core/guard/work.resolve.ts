import { Resolve, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { OpalUser } from 'src/app/core/model/user';
import { tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngxs/store';
import { IvoryError } from 'src/app/core';
import { throwError, EMPTY } from 'rxjs';

@Injectable()
export class WorkResolve implements Resolve<any> {

    constructor(private http: HttpClient, private store: Store, private router: Router) { }

    resolve(route: import('@angular/router').ActivatedRouteSnapshot, state: import('@angular/router').RouterStateSnapshot) {
        let id = route.params.id;
        return this.http.get<Boolean>(`/work/get_work?w=${id}`).pipe(
            catchError((s: IvoryError) => {
                if (s.code == 131) {
                    this.router.navigateByUrl('404', { skipLocationChange: true });
                }
                return EMPTY;
            })
        );
    }

}