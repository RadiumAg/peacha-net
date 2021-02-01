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

  defaultImage = "/assets/image/login_index/loading.png";
  errorImage = "/assets/image/login_index/error.png";

}
