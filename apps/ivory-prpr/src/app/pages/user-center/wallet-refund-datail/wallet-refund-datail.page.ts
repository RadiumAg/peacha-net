import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

type Info={
  id:number,
  app:number,
  amount:number,
  channel:string,
  end_time:string,
  start_time:string,
  pay_id:number,
  pay_amount:number,
  pay_channel:string,
  pay_end_time:string,
  pay_start_time:string,
  orders:{
    order_id:number,
    price:number,
    work_id:number,
    work_name:string,
    work_type:number,
    work_cover:string,
    state:number,
    create_time:string,
    complete_time:string,
    buyer_name:string,
    seller_name:string,
    goods_name:string,
    single:boolean
  }[]
}
@Component({
  selector: 'ivo-wallet-refund-datail',
  templateUrl: './wallet-refund-datail.page.html',
  styleUrls: ['./wallet-refund-datail.page.less']
})
export class WalletRefundDatailPage  {

  constructor(private http:HttpClient,private route:ActivatedRoute,private router:Router) { 

  }

  info$=this.route.queryParams.pipe(
    switchMap(r=>{
      return this.http.get<Info>(`/wallet/record/detail/refund?id=${r.id}`);
    })
  )

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
