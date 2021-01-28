import { BehaviorSubject } from 'rxjs';
import { Inject, OnDestroy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {
  SELECT_TOKEN,
  SELECT_DATA_TOKEN,
} from 'libs/peacha-core/src/lib/core/tokens';
import { SelectData } from '@peacha-core';

@Component({
  selector: 'ivo-live2dorillust',
  templateUrl: './live2dorillust.component.html',
  styleUrls: ['./live2dorillust.component.less'],
})
export class Live2dorillustComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(SELECT_TOKEN) public select_token: BehaviorSubject<boolean>,
    @Inject(SELECT_DATA_TOKEN)
    public select_data_token: BehaviorSubject<SelectData>
  ) {}

  activeList = [false, false];
  nexturl = '';

  select(index: number, url: string): void {
    this.checkedIcon(index);
    this.setSelectData({ next: url });
  }

  private checkedIcon(index: number): void {
    this.activeList = this.activeList.map((x) => false);
    this.activeList[index] = true;
    this.select_token.next(false);
  }

  ngOnInit(): void {
    this.setSelectData({});
  }

  ngOnDestroy(): void {
    this.resetSelect();
  }

  private resetSelect(): void {
    this.select_token.next(true);
  }

  private setSelectData({
    header_title = [
      '请选择你要发布的作品类型',
      '请上传Live2D或人物立绘相关作品',
    ],
    next = '/live2d',
    pre = '',
  }): void {
    this.select_data_token.next({
      header_title,
      next,
      pre,
    });
  }
}
