import { Component, OnInit, ViewChild, ElementRef, Renderer2, HostBinding, HostListener, Input, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';



@Component({
  selector: 'ivo-recommend-work-carousel',
  templateUrl: './recommendWork-carousel.html',
  styleUrls: ['./recommendWork-carousel.less'],
  animations: [
    trigger('workMove', [
      /** 不显示 */
      state('off', style({ 'display': 'none', 'z-index': '0', 'transform': 'translateX(0)' })),
      /** 上一张图片 */
      state('prev', style({
        'z-index': '1',
        'transform': 'translateX(-100%)'
      })),
      /** 下一张图片 */
      state('next', style({ 'z-index': '2', 'transform': 'translateX(100%)' })),
      /** 当前图片 */
      state('on', style({ 'z-index': '3', 'transform': 'translateX(0)' })),
      transition('prev=>on', [
        animate('0.3s ease-in')
      ]),
      transition('next=>on', [
        animate('0.3s ease-in')
      ]),
      transition('on=>prev', [
        animate('0.3s ease-in')
      ]),
      transition('on=>next', [
        animate('0.3s ease-in')
      ])
    ])
  ]
})

export class RecommendWorkCarousel {

 @Input() workList:any;

  current: number;
  partNum:number;


  constructor(private cdr:ChangeDetectorRef) {
    this.current=0;
    this.autoPlay();
  }

  ngOnInit(){
    this.partNum=Math.ceil(this.workList?.length/3);
  }


  @HostListener('mouseenter',['$event.target']) onMouseEnter() {
    clearInterval(this.clear)
  }
  @HostListener('mouseout') onMouseOut() {
    this.autoPlay()
  }
  @HostListener('click') onClick() {
    clearInterval(this.clear);
  }


  ImgState(index: number) {
    
    if (this.workList && this.partNum) {
      if (this.current === 0) {
        return index === 0 ? 'on' :
          index === 1 ? 'next' :
                index === this.partNum - 1 ? 'prev' :
                  'off';
      } else if (this.current === this.partNum - 1) {
        return index === this.partNum - 1 ? 'on' :
          index === this.partNum - 2 ? 'prev' :
                index === 0 ? 'next' :
                  'off';
      }
      switch (index - this.current) {
        case 0:
          return 'on';
        case 1:
          return 'next';
        case -1:
          return 'prev';
        // case -2:
        //   return 'ltwo';
        // case 2:
        //   return 'rtwo';
        // case -3:
        //   return 'lthree';
        // case 3:
        //   return 'rthree';
        default:
          return 'off';
      }
    } else {
      return 'off';
    }

  }

  Next() {
    this.current = (this.current + 1) % this.partNum;

  }
  Prev() {
    this.current = this.current - 1 < 0 ? this.partNum - 1 : this.current - 1;
  }

  


  autoPlay() {
    clearInterval(this.clear);
    this.clear = setInterval(() => {
      this.cdr.markForCheck();
      if (this.current < (this.partNum - 1)) {
        this.current++;
      } else {
        this.current = 0;
      }
    }, 5000)

  }

  clear: any;


}

