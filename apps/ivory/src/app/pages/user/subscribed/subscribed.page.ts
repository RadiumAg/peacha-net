import { Component, OnInit } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, catchError, tap, map } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { Collection, UserState } from '@peacha-core';

@Component({
  selector: 'ivo-subscribed',
  templateUrl: './subscribed.page.html',
  styleUrls: ['./subscribed.page.less'],
})
export class SubscribedPage implements OnInit {
  @Select(UserState.id)
  id$: Observable<number>;

  currentPage$ = new BehaviorSubject<number>(1);

  subscribed$: Observable<Collection> = combineLatest(
    this.route.parent!.params,
    this.route!.queryParams
  ).pipe(
    switchMap(([c, params]) => {
      return this.http
        .get<any>(
          `/work/get_subscribe_collections?u=${c.id}&p=${
            params.page ? params.page - 1 : 0
          }&s=12`
        )
        .pipe(
          tap((_) => {
            this.currentPage$.next(params.page ?? 1);
          })
        );
    }),
    catchError((e) => {
      return of({
        count: 0,
        list: [],
      });
    })
  );

  get pageUid$() {
    return this.route.parent!.params.pipe(map((s) => s.id as number));
  }

  cancelSubscribe(id: number) {
    this.http
      .post('/work/subscribe_collection', {
        c: id,
      })
      .subscribe();
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  toPage(p: number) {
    this.router.navigate([], {
      queryParams: {
        page: p,
      },
      queryParamsHandling: 'merge',
    });
  }
  ngOnInit(): void {}
}
