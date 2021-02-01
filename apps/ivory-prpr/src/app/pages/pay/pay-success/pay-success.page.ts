import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ivo-pay-success',
  templateUrl: './pay-success.page.html',
  styleUrls: ['./pay-success.page.less']
})
export class PaySuccessPage implements OnInit {

  constructor() { }
  
  ngOnInit() {
    window.opener = null;
    window.open('', '_self');
    window.close();
  }



}
