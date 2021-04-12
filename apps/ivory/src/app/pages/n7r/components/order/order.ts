import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ModalRef } from '@peacha-core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';



@Component({
    selector: 'ivo-n7r-order',
    templateUrl: './order.html',
    styleUrls: ['./order.less']
})
export class N7rOrder implements OnDestroy {

    page$ = new BehaviorSubject(0);

    list = [];
    count: number;

    type$ = new BehaviorSubject(0);
    indexId$ = new BehaviorSubject(0);
    scheduledTime: number;

    constructor(
        private modalRef: ModalRef<N7rOrder>,
        private http: HttpClient,
        private scrollDispatcher: ScrollDispatcher,
        private cdr: ChangeDetectorRef
    ) {

    }

    orderList$ = this.page$.pipe(
        switchMap(p => {
            return this.http.get<{
                count: number,
                list: any
            }>(`/shopmall/orders/goods/list?c=25&t=1&p=${p}&s=10`).pipe(
                tap(s => {
                    this.count = s.count;
                    s.list.forEach(l => {
                        this.list.push(l);
                    });
                    this.cdr.detectChanges();
                })
            )
        })
    );


    addressDetail$ = this.indexId$.pipe(
        switchMap(id => {
            return this.http.get<any>(`/shopmall/express/address/detail?o=${id}`)
        })
    )

    detail$ = this.indexId$.pipe(
        switchMap(id => {
            return this.http.get<any>(`/shopmall/orders/detail?o=${id}`)
        })
    )

    scroll$ = this.scrollDispatcher
        .scrolled()
        .pipe(
            tap(scrollable => {
                if (scrollable) {
                    const scroll = scrollable as CdkScrollable;
                    if (scroll.measureScrollOffset('bottom') <= 0) {
                        if (this.count > this.list.length) {
                            this.page$.next(this.page$.value + 1);
                        }
                    }
                }
            })
        )
        .subscribe();





    close(): void {
        this.modalRef.close();
    }

    select(id: number, time: number): void {
        this.type$.next(1);
        this.indexId$.next(id);
        this.scheduledTime = time;
    }



    ngOnDestroy(): void {
        this.scroll$.unsubscribe();
    }

}
