import { switchMap, tap } from 'rxjs/operators';
import { CommissionApiService } from './../service/commission-api.service';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, of, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Commission } from '../model/commission';
// import { Role } from 'src/app/core/state/user.state';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserState } from '@peacha-core';

@Component({
  templateUrl: './commission-index.component.html',
  styleUrls: ['./commission-index.component.less'],
})
export class CommissionIndexComponent implements OnInit, OnDestroy {
  @Select(UserState.id)
  id$!: Observable<number>;

  @Select(UserState.nickname)
  nickname$!: Observable<string>;

  @Select(UserState.avatar)
  avatar$!: Observable<string>;

  @Select(UserState.role)
  role$!: Observable<Array<{ id: number; expiry: number }>>;

  roleIdList: Array<number> = [];

  currentPage = 1;

  routerSub: Subscription;

  sw = 0;

  min = '';
  max = '';
  key = '';

  list$: Observable<{
    list: Commission[];
  }> = this.route.queryParams.pipe(
    switchMap((params) => {
      this.sw = params.sw ?? 0;
      this.priceForm.get('minPrice').setValue(params.min ?? '');
      this.priceForm.get('maxPrice').setValue(params.max ?? '');
      // if (!params.page) {
      //     this.router.navigate([], {
      //         queryParams: {
      //             page: 1
      //         },
      //         queryParamsHandling: 'merge'
      //     });
      //     return of(null);
      // }
      this.currentPage = params.page ?? 1;
      switch (Number(this.sw)) {
        case 0: {
          return this.commissionApi.homePage(
            params.c ?? -1,
            this.currentPage - 1,
            4,
            params.k,
            params.min,
            params.max
          );
        }
        case 1: {
          if (!params.t) {
            this.router.navigate([], {
              queryParams: {
                t: 0,
              },
              queryParamsHandling: 'merge',
            });
            return of(null);
          }
          return this.commissionApi.launchList(
            params.t,
            this.currentPage - 1,
            4
          );
        }
        case 2: {
          if (!params.t) {
            this.router.navigate([], {
              queryParams: {
                t: 0,
              },
              queryParamsHandling: 'merge',
            });
            return of(null);
          }
          return this.commissionApi.signUpList(
            params.t,
            this.currentPage - 1,
            4
          );
        }
      }
    })
  );

  priceForm: FormGroup;
  params$ = this.route.queryParams;

  constructor(
    private commissionApi: CommissionApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.priceForm = this.fb.group({
      minPrice: new FormControl(''),
      maxPrice: new FormControl(''),
    });
  }
  ngOnDestroy(): void {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((p) => {
      if (p.min && p.max) {
        this.priceForm.get('minPrice').setValue(p.min);
        this.priceForm.get('maxPrice').setValue(p.max);
      }
    });
    this.role$.subscribe((s) => {
      s.forEach((l) => {
        this.roleIdList.push(l.id);
      });
    });
  }

  toDetail(id: number, status: number, event: any): void {
    event.stopPropagation();
    this.router.navigate(['/commission/detail'], {
      queryParams: {
        id,
        status,
      },
    });
  }

  toPage(p: number): void {
    this.router.navigate([], {
      queryParams: {
        page: p,
      },
      queryParamsHandling: 'merge',
    });
  }

  search(min, max, key): void {
    const k = key.replace(/\s+/g, '');

    if (min == '') {
      this.priceForm.get('minPrice').setValue(0);
      min = 0;
    } else if (max == '') {
      this.priceForm.get('maxPrice').setValue(999999);
      max = 999999;
    } else if (max && min && max < min) {
      this.priceForm.get('minPrice').setValue(max);
      this.priceForm.get('maxPrice').setValue(min);
      min = max;
      max = min;
    }
    this.cdr.markForCheck();

    this.router.navigate([], {
      queryParams: {
        min,
        max,
        k,
      },
      queryParamsHandling: 'merge',
    });
  }

  isInput(e: any): void {
    if (
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 96 && e.keyCode <= 105) ||
      e.keyCode === 8 ||
      e.keyCode === 13
    ) {
      console.log(e.keyCode);
    } else {
      e.preventDefault();
    }
  }
}
