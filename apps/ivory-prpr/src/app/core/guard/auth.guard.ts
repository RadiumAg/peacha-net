import { Store } from '@ngxs/store';
import { CanLoad, Route, UrlSegment, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';

export class AuthGuard implements CanLoad {
    constructor(private store: Store,private router:Router) {

    }

    canLoad(route: Route, segments: UrlSegment[]) {
        return this.store.selectOnce<number>(s => s.uid).pipe(
            map(s => s > 0),
            tap(s=>{
                if(!s){

                }
            }));
    }
}