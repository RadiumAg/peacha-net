import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { interval } from 'rxjs';
import { take, map } from 'rxjs/operators';

const Timeout = 1800;

@Component({
  selector: 'ivo-cd',
  template: ` <span>{{ item$ | async | mydate: 'mm:ss' }}</span> `,
})
export class CdComponent implements OnInit {
  constructor(private router: Router) {}
  @Input()
  createtime: string;

  @Output()
  cdTimeout = new EventEmitter();

  item$ = interval(1000).pipe(
    take(Timeout),
    map((i) => {
      const remain =
        Number(this.createtime) + Timeout * 1000 - new Date().getTime();
      if (remain > 0) {
        return Number(this.createtime) + Timeout * 1000 - new Date().getTime();
      } else {
        this.cdTimeout.emit();
        return 0;
      }
    })
  );

  ngOnInit(): void {}
}
