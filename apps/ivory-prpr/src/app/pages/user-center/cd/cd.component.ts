import { Component, OnInit, Input } from '@angular/core';
import { interval } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Component({
  selector: 'ivo-cd',
  template: `
       <span>{{item$|async|mydate:"mm:ss"}}</span>
  `,
})
export class CdComponent implements OnInit {
  constructor() {
}
  @Input()
  createtime: string;

  item$ = interval(1000).pipe(
    take(1800),
    map(i => {
        if (i <= 1800) {
                return  Number(this.createtime)  +1800*1000-new Date().getTime();
        }
        else { return 0; }
    })
);


  ngOnInit(): void {
  }




}
