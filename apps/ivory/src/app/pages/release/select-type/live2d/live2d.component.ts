import { ActivatedRoute, Router } from '@angular/router';
import { CertifiedTipsComponent } from './../../components/certified-tips/certified-tips.component';
import { Inject, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { take, tap } from 'rxjs/operators';
import { app_config } from '../../../../../global.config';
import { SelectData, ModalService, UserState } from '@peacha-core';
import {
  SELECT_TOKEN,
  SELECT_DATA_TOKEN,
} from 'libs/peacha-core/src/lib/core/tokens';

@Component({
  selector: 'ivo-live2d',
  templateUrl: './live2d.component.html',
  styleUrls: ['./live2d.component.less'],
})
export class Live2dComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(SELECT_TOKEN) public select_token: BehaviorSubject<boolean>,
    @Inject(SELECT_DATA_TOKEN)
    public select_data_token: BehaviorSubject<SelectData>,
    private router: Router,
    private modal: ModalService
  ) {}

  @Select(UserState.isLogin)
  isLogin$: Observable<boolean>;

  @Select(UserState.identity_state)
  identity_state$: Observable<number>;

  activeList = [false, false];
  nexturl;
  paid_enabled = app_config.enablePaid;

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.resetSelect();
  }

  select(index: number, url: string) {
    if (url === 'live2d/paid') {
      combineLatest([this.isLogin$, this.identity_state$])
        .pipe(
          take(1),
          tap(([is, s]) => {
            if (is) {
              if (s === 2) {
                this.checkedIcon(index);
                this.setSelectData({ next: url });
              } else {
                this.modal.open(CertifiedTipsComponent);
              }
            }
          })
        )
        .subscribe();
    } else {
      this.checkedIcon(index);
      this.setSelectData({ next: url });
    }
  }

  private checkedIcon(index: number) {
    this.activeList = this.activeList.map((x) => false);
    this.activeList[index] = true;
    this.select_token.next(false);
  }

  private init() {
    this.setSelectData({});
  }

  /**
   * @description 设置页脚信息
   */
  private setSelectData({
    header_title = [
      '请选择Live2D的展示方式',
      '正确选择，让更多人看到你的作品~',
    ],
    next = 'live2d/free',
    pre = '/release',
  }) {
    this.select_data_token.next({
      header_title,
      next,
      pre,
    });
  }

  private resetSelect() {
    this.select_token.next(true);
  }
}
