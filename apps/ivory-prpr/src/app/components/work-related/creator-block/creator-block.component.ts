import { Component, OnInit, Input, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'ivo-creator-block',
  templateUrl: './creator-block.component.html',
  styleUrls: ['./creator-block.component.less']
})
export class CreatorBlockComponent {


  @Input() userName:string;
  @Input() userId:number;
  @Input() userAvatar:string;
  @Input() followState: number;
  @Input() role:'binder'|'drawer';

  constructor(private router:Router) { }

  click(){
    this.router.navigateByUrl('/user/'+this.userId);
  }
}
