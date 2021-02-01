import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'input[ivo-input],textarea[ivo-input]',
  templateUrl: './input.html',
  styleUrls: ['./input.less']
})
export class IvoInput implements OnInit {

  @Input('ivoType') type: "default" | "rounded" | undefined;

  constructor() { }

  ngOnInit(): void {
  }

}
