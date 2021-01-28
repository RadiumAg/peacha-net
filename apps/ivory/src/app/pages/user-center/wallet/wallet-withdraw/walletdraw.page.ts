import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TradeApiService } from '../../../pay/trade-api.service';

@Component({
  selector: 'ivo-walletdraw',
  templateUrl: './walletdraw.page.html',
  styleUrls: ['./walletdraw.page.less'],
})
export class WalletDrawPage implements OnInit {
  constructor(
    private tradeapi: TradeApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {}
  cashout$ = combineLatest([this.route.params]).pipe(
    switchMap(([r]) => {
      return this.tradeapi.queryWalletCashout(r.id).pipe(
        switchMap((s) => {
          s.amount = Math.abs(s.amount);
          return of(s);
        })
      );
    })
  );
}
