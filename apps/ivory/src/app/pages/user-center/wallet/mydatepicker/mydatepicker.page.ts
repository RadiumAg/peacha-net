import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ivo-mydatepicker',
  templateUrl: './mydatepicker.page.html',
  styleUrls: ['./mydatepicker.page.less'],
})
export class MydatepickerPage implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  dateMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  thisYear = new Date().getFullYear();
  thisMonth = new Date().getMonth() + 1;
}
