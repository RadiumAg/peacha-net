import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

type PayDetail = {
  id: number,
  app: number,
  amount: number,
  credited_time: number,
  share: number,
  total_amount: number,
  commission: number,
  rate: number
  orders: {
    order_id: number,
    price: number,
    work_id: number,
    work_name: string,
    work_type: number,
    work_cover: string,
    state: number,
    create_time: number,
    complete_time: number,
    buyer_name: string,
    seller_name: string,
    goods_name: string,
    single: boolean
  }
}
@Component({
  selector: 'ivo-wallet-income-datail',
  templateUrl: './wallet-income-datail.page.html',
  styleUrls: ['./wallet-income-datail.page.less']
})
export class WalletIncomeDatailPage {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {

  }


  type$ = new BehaviorSubject(0);

  orderinfo$ = this.route.queryParams.pipe(
    tap(s=>{
      this.type$.next(s.type)
    }),
    switchMap(r => {
      //console.log(r.id)
      return this.http.get<PayDetail>(`/wallet/record/detail/income?id=${r.id}`);
    })
  )
  goBack() {
    history.go(-1)
  }

  toWork(c: number, id: number) {
    if (c) {
      this.router.navigate(['illust', id])
    } else {
      this.router.navigate(['live2d', id])
    }
  }
}
