import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'ivo-wallet-cashout-detail',
  templateUrl: './wallet-cashout-detail.page.html',
  styleUrls: ['./wallet-cashout-detail.page.less']
})
export class WalletCashoutDetailPage  {

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient,
  ) { }



  payinfo$=this.route.queryParams.pipe(
    switchMap(r=>{
      return this.http.get<{
        id:number,
        amount:number,
        commission:number,
        channel:string,
        payee_account:string,
        payee_name:string,
        status:number,
        end_time:string,
        start_time:string,
        reason:number
      }>(`/wallet/record/detail/cashout?id=${r.id}`);
    })
  )


  return(){
    history.go(-1);
  }
}
