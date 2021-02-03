import { Component, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ivo-wallet-recharge-detail',
  templateUrl: './wallet-recharge-detail.page.html',
  styleUrls: ['./wallet-recharge-detail.page.less']
})
export class WalletRechargeDetailPage implements OnInit {

  constructor(
    private route:ActivatedRoute,
    private http:HttpClient,
  ) { }

  ngOnInit(): void {
  }

  payinfo$:Observable<{
      id:number,
      amount:number,
      channel:string,
      start_time:number,
  }>=this.route.queryParams.pipe(
    switchMap(r=>{
      return this.http.get<any>(`/wallet/record/detail/recharge?id=${r.id}`);
    })
    )


    goBack(){
      history.go(-1)
    }

}
