import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SharedService } from '../live.service';

type Production = {
  count: number;
  list: {
    id: number;
    cover: string;
    name: string;
    type: number;
    publishtime: number;
    state: number;
    time: number;
    is_cooperates: number;
  }[];
};
@Component({
  selector: 'ivo-live-success',
  templateUrl: './live-success.page.html',
  styleUrls: ['./live-success.page.less'],
})
export class LiveSuccessPage {
  currentPage$ = new BehaviorSubject(1);
  m: FormControl = new FormControl(-1);
  key: FormControl = new FormControl('');
  showList: any = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private _sharedService: SharedService
  ) {}

  update$ = new BehaviorSubject<boolean>(true);

  b = this.m.valueChanges
    .pipe(
      switchMap((m) => {
        return this.router.navigate([], {
          queryParams: { m },
          queryParamsHandling: 'merge',
        });
      })
    )
    .subscribe();

  params$ = this.route.queryParams.pipe(
    tap((params) => {
      this.m.setValue(params.m);
      this.key.setValue(params.k);
    })
  );

  keyword() {
    this.router.navigate([], {
      queryParams: {
        k: this.key.value,
        p: 1,
      },
      queryParamsHandling: 'merge',
    });
  }

  works$ = combineLatest(this.update$, this.route.queryParams).pipe(
    switchMap(([up, params]) => {
      return this.http
        .get<Production>(
          `/work/get_create_live?k=${params.k ?? ''}&p=${
            params.p ? params.p - 1 : 0
          }&s=6&ss=${params.m ?? -1}`
        )
        .pipe(
          tap((s) => {
            this.showList = s.list;
            this.currentPage$.next(params.p ?? 1);
            s.list.map((l) => {
              l.time = l.publishtime + 7 * 24 * 60 * 60 * 1000 - Date.now();
            });
          })
        );
    })
  );

  toPage(p: number) {
    this.router.navigate([], {
      queryParams: {
        p: p,
      },
      queryParamsHandling: 'merge',
    });
    document.documentElement.scrollTop = 0;
  }

  ll(i: boolean) {
    if (i) {
      if (this.showList.length == 1 && this.currentPage$.value > 1) {
        this.toPage(this.currentPage$.value - 1);
        this._sharedService.emitChange(1);
      } else {
        this.update$.next(false);
        this._sharedService.emitChange(1);
      }
    }
  }

  changePage() {
    this.router.navigate([], {
      queryParams: {
        p: 1,
      },
      queryParamsHandling: 'merge',
    });
  }
}
