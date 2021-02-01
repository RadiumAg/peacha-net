import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap, take, distinctUntilChanged, shareReplay, skip } from 'rxjs/operators';


@Component({
    selector: 'ivo-page',
    templateUrl: './page.html',
    styleUrls: ['./page.less'],
})
export class Page {
    total$ = new BehaviorSubject(0);
    pageSize$ = new BehaviorSubject(10);

    /**
     * 当前页(从1开始)
     */
    @Input() set currentPage(v: string) {
        this.pretendCurrentPage$.pipe(
            skip(1),
            tap((_) => {
                this.pretendCurrentPage$.next(Number(v));
                this.cdr.markForCheck();
            })
        );
        // this.pretendCurrentPage$.next(Number(v));
    }
    /**
     * 数据总数
     */
    @Input() set total(v: number) {
        this.total$.next(v);
    }

    /**
     * 页大小
     */
    @Input() set pageSize(v: number) {
        this.pageSize$.next(v);
    }
    /**
     * currentPage(从0开始)
     */
    @Output() onPageChange = new EventEmitter<number>();

    pageCount$ = combineLatest(this.total$, this.pageSize$).pipe(
        map(([total, pageSize]) => {
            return Math.ceil(total / pageSize);
        })
    );

    constructor(private cdr: ChangeDetectorRef) {}

    pretendCurrentPage$ = new BehaviorSubject(1);

    toPage(input: HTMLInputElement) {
        const a = Number(input.value);
        this.pageCount$
            .pipe(
                take(1),
                tap((pageCount) => {
                    if (a <= pageCount && a > 0) {
                        this.pretendCurrentPage$.next(a);
                    }
                })
            )
            .subscribe();
    }

    changePage(actionKey: number) {
        this.currentPage$.pipe(take(1)).subscribe((c) => {
            if (actionKey > 0) {
                this.pretendCurrentPage$.next(actionKey);
            }
        });
    }

    currentPage$: Observable<number> = combineLatest(
        this.pretendCurrentPage$,
        this.pageCount$
    ).pipe(
        map(([p, c]) => {
            if (p > c) {
                return (p = c);
            } else {
                return p;
            }
        }),
        distinctUntilChanged(),
        tap((v) => {
            if (v - 1 >= 0) {
                this.onPageChange.emit(v);
            }
        }),
        shareReplay()
    );

    showFrontDots$ = combineLatest(this.currentPage$, this.pageCount$).pipe(
        map(([c, p]) => {
            if (c <= 4 || p <= 7) {
                return true;
            }
            return false;
        })
    );

    showBackDots$ = combineLatest(this.currentPage$, this.pageCount$).pipe(
        map(([c, p]) => {
            if (p - c <= 3 || p <= 7) {
                return true;
            }
            return false;
        })
    );

    pageList$ = combineLatest(this.currentPage$, this.pageCount$).pipe(
        map(([current, pageCount]) => {
            const list = new Array();
            if (pageCount > 7) {
                for (
                    let i = Number(current) - 2;
                    i < Number(current) + 3;
                    i++
                ) {
                    list.push(i);
                }
                let first = list.indexOf(1);
                let last = list.indexOf(pageCount);
                if (first >= 0) {
                    list.splice(0, first + 1);
                    let end = list.pop();
                    for (let j = end; j < end + first + 2; j++) {
                        list.push(j);
                    }
                } else if (last > 0) {
                    list.splice(last, 6 - last);
                    let start = list.shift();
                    for (let j = start; j > start + last - 6; j--) {
                        list.unshift(j);
                    }
                }
            } else {
                for (let i = 2; i < pageCount; i++) {
                    list.push(i);
                }
            }
            return list;
        })
    );
}

function compare(a: number, b: number): boolean {
  if (a != b) {
    return false;
  } else {
    return true;
  }

}
