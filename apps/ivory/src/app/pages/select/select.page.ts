import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Works } from '@peacha-core';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';


@Component({
    selector: 'ivo-select-hh',
    templateUrl: './select.page.html',
    styleUrls: ['./select.page.less'],
})
export class SelectPage {



    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private router: Router
    ) { }

    priceRegion = [
        { sp: 0, ep: 0 },
        { sp: 0, ep: 500 },
        { sp: 500, ep: 1000 },
        { sp: 1000, ep: 2000 },
        { sp: 2000, ep: 3000 },
        { sp: 3000, ep: '' },
    ];
    page$ = new BehaviorSubject(1);
    works$ = this.route.queryParams.pipe(
        switchMap((r) => {
            return this.http
                .get<Works>(
                    // eslint-disable-next-line max-len
                    `/work/search_work?p=${r.p ? r.p - 1 : 0}&s=20&o=${r.o ?? 1}&sp=${r.m ? this.priceRegion[r.m].sp : 0}&ep=${r.m ? this.priceRegion[r.m].ep : 0}&dd=${r.dd ?? 0}&c=${r.c === undefined ? '-1' : r.c}&ws=${r.ws === undefined ? '-1' : r.ws}&ft=${r.ft === undefined ? '-1' : r.ft}
                    `
                )
                .pipe(
                    tap(_s => {
                        this.page$.next(r.p ?? 1);
                    })
                    // catchError((err) => of({ count: 0 }))
                );
        })
    );

    page(data: number): void {
        this.router.navigate([], {
            queryParams: {
                p: data,
            },
            queryParamsHandling: 'merge',
        });
        document.documentElement.scrollTop = 0;
    }





}
