import { Component } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap, catchError } from 'rxjs/operators';


type HotWork = {
    count: number;
    list: {
        id: number,
        cover: string,
        name: string,
        like_count: number,
        collect_count: number,
        price: number,
        state: number,
        nickname: string,
        category: number
    }[];
}

@Component({
    selector: 'ivo-public-work',
    templateUrl: './public-work.page.html',
    styleUrls: ['../reuse.less']
})
export class PublicWorkPage {
    pagePublicWork$ = new BehaviorSubject<number>(0);
    publicWorkList: Array<any> = [];
    currentPage$ = new BehaviorSubject<number>(1);

    /**公示期作品 */
    publicWork$ = this.route.queryParams.pipe(
        switchMap(s => {
            return this.http.get<HotWork>(`/work/public_work?p=${s.page - 1 ?? 0}&s=20`).pipe(
                tap(l => {
                    this.currentPage$.next(s.page ?? 1);
                }),
                catchError(e => {
                    return of({
                        count: 0,
                        list: []
                    });
                })
            )
        })
    )
    constructor(
        private router: Router,
        private http: HttpClient,
        private route: ActivatedRoute
    ) { }


    toPagePublic(p: number) {
        this.router.navigate([], {
            queryParams: {
                page: p
            },
            queryParamsHandling: 'merge'
        });
        document.documentElement.scrollTop = 0;
    }

    toWork(id: number, c: number) {
        //console.log(c)
        if (c == 1) {
            this.router.navigate(['illust', id])
        } else {
            this.router.navigate(['live2d', id])
        }
    }
    toUser(id: number) {
        this.router.navigate(['user', id])

    }
}
