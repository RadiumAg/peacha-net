import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ivo-lazy-img',
  templateUrl: './lazy-img.component.html',
  styleUrls: ['./lazy-img.component.less']
})
export class LazyImgComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  ngLazyLoad:string;

  /**border  1:左上角右上角圆角为4   2:右下角右上角圆角为4   3:右下角左下角圆角为4    4:右下角左上角圆角为4  5：圆角为4    6：圆角50%*/
  @Input()
  border?:number;

  @Input()
  objectFit?:boolean;

  defaultImage = "/assets/image/login_index/loading.png";
  errorImage = "/assets/image/login_index/error.png";

}
