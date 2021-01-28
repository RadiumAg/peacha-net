import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, tap, map } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest, BehaviorSubject } from 'rxjs';
import { Select } from '@ngxs/store';
import { NewCollection } from './new-collection/new-collection';
import { UserState, Collection, ModalService } from '@peacha-core';

@Component({
  selector: 'ivo-created',
  templateUrl: './created.page.html',
  styleUrls: ['./created.page.less'],
})
export class CreatedPage implements OnInit {
  @Select(UserState.id)
  id$: Observable<number>;

  refresh$ = new BehaviorSubject<number>(0);
  create$: Observable<Collection> = combineLatest(
    this.route.parent!.params,
    this.route!.queryParams,
    this.refresh$
  ).pipe(
    switchMap(([c, params]) => {
      return this.http
        .get<any>(
          `/work/get_create_collections?u=${c.id}&p=${
            params.page ? params.page - 1 : 0
          }&s=12`
        )
        .pipe(
          tap((_) => {
            this.indexPage$.next(params.page ?? 1);
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

  indexPage$ = new BehaviorSubject<number>(1);

  get pageUid$() {
    return this.route.parent!.params.pipe(map((s) => s.id as number));
  }

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private modal: ModalService
  ) {}

  createCollection() {
    this.modal
      .open(NewCollection)
      .afterClosed()
      .subscribe((s) => {
        this.refresh$.next(s);
      });
  }

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
