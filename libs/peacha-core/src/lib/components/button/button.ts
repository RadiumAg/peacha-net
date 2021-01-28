import '../../../components.less';
import {
  OnInit,
  ElementRef,
  Renderer2,
  Directive,
  HostListener,
  HostBinding,
  Input,
} from '@angular/core';

@Directive({
  selector: '[ivo-button]',
})
export class Button implements OnInit {
  /**
   * type:1 button样式为background:#fff,color:主题色
   * type:0/underfind button样式为background:主题色,color:#fff
   *
   * @type {number}
   * @memberof Button
   */
  @Input() buttonType?: number;
  constructor(private el: ElementRef, private re2: Renderer2) {}

  @HostBinding('style.color') color: string;
  @HostBinding('style.background') background: string;
  @HostBinding('style.cursor') cursor: string;
  @HostBinding('style.transition') transition: string;
  @HostBinding('style.border') border: string;

  ngOnInit(): void {
    this.cursor = 'pointer';

    if (this.buttonType === 1) {
      this.color = '#FF778F';
      this.background = '#ffffff';
      this.border = '1px solid #FF778F';
    } else {
      this.color = '#ffffff';
      this.background = '#FF778F';
      this.border = '1px solid #FF778F';
    }
  }

  @HostListener('mouseover', ['$event'])
  hover(e: Event): void {
    this.transition = 'all 0.2s ease 0s';
    if (this.buttonType === 1) {
      this.background = '#FFECEF';
    } else {
      this.background = '#FF98AB';
      this.border = '1px solid #FF98AB';
    }
  }
  @HostListener('mouseout', ['$event'])
  out(e: Event): void {
    this.transition = 'all 0.2s ease 0s';
    if (this.buttonType === 1) {
      this.background = '#ffffff';
    } else {
      this.background = '#FF778F';
      this.border = '1px solid #FF778F';
    }
  }

  // @HostListener('click', ['$event'])
  // click(e: Event): void {
  //     this.transition = 'all 0.2s ease 0s';
  //     if (this.buttonType === 1) {
  //         this.background = '#FFCCD4';
  //     } else {
  //         this.background = '#FF98AB';
  //         this.border = '1px solid #FF778F';
  //     }

  // }
}
