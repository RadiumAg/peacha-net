import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ivo-related-work',
  templateUrl: './related-work.component.html',
  styleUrls: ['./related-work.component.less']
})
export class RelatedWorkComponent {

  constructor(private router: Router) { }

  @Input() cover: string;

  @Input() time: string;

  @Input() authorName: string;

  @Input() name: string;

  @Input() id: string;

  @Input() category: number;

  // @HostListener('click')
  // click() {
  //   //TODO: type
  //   if (this.category == 0) {

  //     this.router.navigateByUrl('/live2d/' + this.id);
  //   } else if (this.category == 1) {

  //     this.router.navigateByUrl('/illust/' + this.id);
  //   }
  // }

}
