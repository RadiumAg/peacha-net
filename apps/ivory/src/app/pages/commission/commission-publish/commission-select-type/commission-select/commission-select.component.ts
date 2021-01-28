import { Inject, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { SelectData } from '@peacha-core';
import {
  SELECT_TOKEN,
  SELECT_DATA_TOKEN,
} from 'libs/peacha-core/src/lib/core/tokens';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';

@Component({
  selector: 'ivo-live2d',
  templateUrl: './commission-select.component.html',
  styleUrls: ['./commission-select.component.less'],
})
export class CommissionSelect implements OnInit, OnDestroy {
  constructor(
    @Inject(SELECT_TOKEN) public select_token: BehaviorSubject<boolean>,
    @Inject(SELECT_DATA_TOKEN)
    public select_data_token: BehaviorSubject<SelectData>
  ) {}

  activeList = [false, false];
  nexturl;

  ngOnInit() {
    this.init();
  }

  ngOnDestroy(): void {
    this.resetSelect();
  }

  select(index: number, url: string) {
    this.checkedIcon(index);
    this.setSelectData({ next: url });
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
    header_title = ['发起约稿', ''],
    next = 'live2d',
    pre = '/commission',
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
