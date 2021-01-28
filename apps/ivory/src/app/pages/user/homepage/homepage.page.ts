import { Component, ChangeDetectorRef, TrackByFunction } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  of,
  BehaviorSubject,
  combineLatest,
  fromEvent,
  merge,
  Subject,
  ReplaySubject,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  switchMap,
  catchError,
  tap,
  map,
  take,
  debounceTime,
  filter,
  mergeMap,
  share,
  shareReplay,
} from 'rxjs/operators';
import { Select } from '@ngxs/store';
import {
  UserState,
  Work,
  WorkSale,
  WorkCategory,
  ModalService,
  WorkApiService,
} from '@peacha-core';
import { WorkSelectorComponent } from 'libs/peacha-core/src/lib/components/work-selector/work-selector.component';

@Component({
  selector: 'ivo-homepage',
  templateUrl: './homepage.page.html',
  styleUrls: ['./homepage.page.less'],
})
export class HomepagePage {
  @Select(UserState.id)
  id$: Observable<number>;

  pageId$ = this.route.params.pipe(
    map((s) => Number(s.id) as number),
    tap((id) => {
      this.count = 0;
      this.page = 1;
      this.cache = [];
    })
  );

  Addpic$ = new BehaviorSubject(true);
  showEdit$ = new BehaviorSubject(true);

  representidList = [];
  representList = [];
  originalList = [];
  originalidList = [];

  refresh$ = new BehaviorSubject<number>(0);

  represent$ = combineLatest([this.pageId$, this.refresh$]).pipe(
    switchMap(([id, r]) => {
      return this.workApi.getRepresentWork(id).pipe(
        tap((s) => {
          this.representidList = s.list.map((u: { id: number }) => u.id);
          this.originalidList = s.list.map((u: { id: number }) => u.id);
          this.representList = s?.list;
          this.originalList = s?.list;
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

  count = 0;
  private cache = [];
  private page = 1;
  private pageSize = 10;

  private loadByScroll$ = merge(
    this.pageId$.pipe(take(1)),
    fromEvent(window, 'scroll')
  ).pipe(
    filter((id) => {
      return (
        typeof id === 'number' ||
        (window.pageYOffset + window.innerHeight >=
          document.documentElement.scrollHeight &&
          (this.count === 0 || this.count > this.cache.length))
      );
    }),
    debounceTime(200)
  );

  loadedItems$ = combineLatest([this.pageId$, this.loadByScroll$]).pipe(
    mergeMap(([id, _]) => {
      return this.workApi
        .getWorks(
          id,
          this.page,
          this.pageSize,
          '',
          WorkSale.All,
          WorkCategory.All
        )
        .pipe(
          tap(() => {}),
          tap((res) => {
            this.count = res.count;
            this.cache = [...this.cache, ...res.list];
            this.page++;
          }),
          map(() => this.cache)
        );
    })
  );

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private modal: ModalService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private workApi: WorkApiService
  ) {}

  changeBest(): void {
    this.modal
      .open(WorkSelectorComponent, {
        type: 'all',
        exclouds: this.representidList,
      })
      .afterClosed()
      .subscribe((work) => {
        if (work) {
          this.representList.push(work);
          this.originalidList = this.representList;
          this.representidList.push(work.id);
          this.cdr.markForCheck();
          this.save();
        }
      });
  }

  toWork(id: number, c: number): void {
    if (c == 1) {
      this.router.navigate(['illust', id]);
    } else {
      this.router.navigate(['live2d', id]);
    }
  }

  cancel(): void {
    this.showEdit$.next(true);
    this.representidList = JSON.parse(JSON.stringify(this.originalidList));
    this.representList = JSON.parse(JSON.stringify(this.originalList));
  }

  save(): void {
    this.showEdit$.next(true);
    this.http
      .post('/work/set_represent_work', {
        w: this.representidList,
      })
      .subscribe((_) => {
        this.originalidList = this.representidList;
        this.originalList = this.representList;
      });
  }

  deleteWork(i: number, event: Event): void {
    event.stopPropagation();
    if (this.representidList.indexOf(i) != -1) {
      this.representidList.splice(this.representidList.indexOf(i), 1);
      this.representList = this.representList.filter((v) => {
        return v.id != i;
      });
    }
  }
}
