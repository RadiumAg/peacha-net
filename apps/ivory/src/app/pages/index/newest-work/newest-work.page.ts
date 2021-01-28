import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { BehaviorSubject, combineLatest, empty, Subscription } from 'rxjs';
import { tap, take, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


type Newest = {
  list: {
    id: number,
    public_date: number,
    public_userid: number,
    public_username: string,
    public_useravatar: string,
    work: {
      work_id: number,
      work_name: string,
      description: string,
      collect_count: number,
      state: number,
      cover: string,
      type: number,
    }
  }[]
}
@Component({
  selector: 'ivo-newest-work',
  templateUrl: './newest-work.page.html',
  styleUrls: ['../reuse.less']
})



export class NewestWorkPage {
  subscription: Subscription
  newestOnce$ = new BehaviorSubject<number>(0);
  pageNewest$ = new BehaviorSubject<number>(1);
  newestList: Array<any> = [];

  /**最新作品动态 */
  newest$ = this.http.get<Newest>(`/news/newest?page=0&size=20`).pipe(
    tap(s => {
      s.list.map(l => {
        this.newestList.push(l)
      });
      this.newestOnce$.next(s.list.length)
      this.pageNewest$.next(1);
    })
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  toWork(id: number, c: number) {
    if (c == 1) {
      this.router.navigate(['illust', id])
    } else {
      this.router.navigate(['live2d', id])
    }
  }
  @HostListener('window:scroll', ['$event']) public scrolled($event: Event) {
    if (document.documentElement.scrollHeight - document.documentElement.scrollTop == document.documentElement.clientHeight) {
      combineLatest(
        this.newestOnce$,
        this.pageNewest$
      ).pipe(
        take(1),
        switchMap(([o, s]) => {
          if (o == 20) {
            return this.http.get<Newest>(`/news/newest?page=${s}&size=20`).pipe(
              tap(l => {
                l.list.map(a => {
                  this.newestList.push(a)
                });
                this.newestOnce$.next(l.list.length)
                this.pageNewest$.next(s + 1);
                this.cdr.markForCheck()
              })
            )
          }
          return empty()
        }),

      ).subscribe()
    }
  }

  // moreOne() {
  //   this.pageNewest$.pipe(
  //       take(1),
  //       switchMap(s => {
  //           return this.http.get<Newest>(`/news/newest?page=${s}&size=20`).pipe(
  //               tap(l => {
  //                   l.list.map(a => {
  //                       this.newestList.push(a)
  //                   });
  //                   this.newestOnce$.next(l.list.length)
  //                   this.pageNewest$.next(s + 1);
  //                   this.cdr.markForCheck()
  //               })
  //           )
  //       })
  //   ).subscribe()
  // }


  toUser(id: number) {
    this.router.navigate(['user', id])

  }

}
