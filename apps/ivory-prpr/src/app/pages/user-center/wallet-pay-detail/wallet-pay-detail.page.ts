import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

type PayDetail={
  id:number,
  app:number,
  amount:number,
  channel:string,
  end_time:string,
  start_time:number,
  orders:{
     order_id:number,
     price:number,
     work_id:number,
     work_name:string,
     work_type:number,
     work_cover:string,
     state:number,
     create_time:number,
     complete_time:number,
     buyer_name:string,
     seller_name:string,
     goods_name:string,
     single:boolean
  }[]
}
@Component({
  selector: 'ivo-wallet-pay-detail',
  templateUrl: './wallet-pay-detail.page.html',
  styleUrls: ['./wallet-pay-detail.page.less']
})
export class WalletPayDetailPage implements OnInit {

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient,
    private router:Router
  ) {

   }

  ngOnInit(): void {
  }

  orderinfo$=this.route.queryParams.pipe(
  switchMap(r=>{
    //console.log(r.id)
    return this.http.get<PayDetail>(`/wallet/record/detail/pay?id=${r.id}`);
  })
  )


  price$ = this.orderinfo$.pipe(
    map(orderinfo => {
      return orderinfo.orders.map(o => o.price).reduce((a, b) => {
        return a + b;
      }, 0);
    })
  );

  goBack(){
    history.go(-1)
  }

  toWork(c: number,id:number) {
    if(c){
      this.router.navigate(['illust', id])
    }else{
      this.router.navigate(['live2d', id])
    }
  }
}
