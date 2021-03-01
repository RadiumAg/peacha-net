import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ivo-user-linkage-order-page',
  templateUrl: './user-linkage-order-page.component.html',
  styleUrls: ['./user-linkage-order-page.component.less']
})
export class UserLinkageOrderPage{

    constructor(private http:HttpClient){}

    page$ = new BehaviorSubject<number>(1);
    orders$ = combineLatest(
        this.page$
    ).pipe(
        switchMap(([page])=>{
            return (this.http.get(`/link/v1/client/order?p=${page-1}&s=10`) as Observable<{
                count:number,
                list:[{
                    hours:number,
                    completetime:number,
                }]}>);
        })
    )
}
