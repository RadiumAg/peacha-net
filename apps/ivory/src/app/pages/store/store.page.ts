import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ivo-store',
  templateUrl: './store.page.html',
  styleUrls: ['./store.page.less'],
})
export class StorePage implements AfterViewInit {
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private render: Renderer2
  ) {}

  page$ = new BehaviorSubject<number>(0);
  workCount$ = new BehaviorSubject(0);
  workId$ = new BehaviorSubject(0);
  paramsPage$ = new BehaviorSubject(0);

  params$ = this.route.queryParams.subscribe((r) => {
    if (r.id && r.id != this.workId$.value) {
      this.workId$.next(r.id);
    }
    if (r.p && r.p != this.paramsPage$.value) {
      this.paramsPage$.next(r.p);
    }
  });

  works$: Observable<{
    count: number;
    list: {
      id: number;
      cover: string;
      name: number;
      type: number;
      publishtime: string;
      download_address: string;
      state: number;
    }[];
  }> = this.paramsPage$.pipe(
    switchMap((r) => {
      return this.http
        .get<any>(`/work/get_own_works?p=${r != 0 ? r - 1 : 0}&s=12`)
        .pipe(
          tap((s) => {
            this.workCount$.next(s.count);
            this.page$.next(r ?? 1);
          })
        );
    })
  );

  item$ = combineLatest([this.workId$, this.works$]).pipe(
    switchMap(([id, w]) => {
      return this.http.get<any>(
        `/work/get_own_work_detail?w=${id == 0 ? w.list[0].id : id}`
      );
    }),
    catchError((e) => {
      return of({ count: 0 });
    })
  );

  @ViewChild('bgc')
  bgc: ElementRef;

  ngAfterViewInit(): void {
    const timer = setInterval(() => {
      if (this.bgc?.nativeElement) {
        this.render.setStyle(
          this.bgc.nativeElement,
          'height',
          window.innerHeight - 106 + 'px'
        );
        clearInterval(timer);
      }
    }, 1);
  }

  page(data: number) {
    this.router.navigate([], {
      queryParams: {
        p: data,
      },
      queryParamsHandling: 'merge',
    });
    document.documentElement.scrollTop = 0;
  }
  selectOne(id: number) {
    this.router.navigate([], {
      queryParams: {
        id,
      },
      queryParamsHandling: 'merge',
    });
  }
  download(id: number) {
    this.http
      .post('/work/download_goods', {
        g: id,
      })
      .subscribe((s: any) => {
        window.open(s.url);
      });
  }
  downloadwork(id: number) {
    this.http
      .post('/work/download_work', {
        g: id,
      })
      .subscribe((s: any) => {
        window.open(s.url);
      });
  }

  toWork(id: number, c: number) {
    if (c == 1) {
      this.router.navigate(['illust', id]);
    } else {
      this.router.navigate(['live2d', id]);
    }
  }
}
