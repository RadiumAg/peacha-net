import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExchangeApiSrevice {
  readonly userRate = '/user/rate';

  private readonly  baseUrl = '/link/v1';

  readonly code = this.baseUrl + '/client/code'; // 兑换兑换码

  readonly code_uselog = this.baseUrl + '/client/code_uselog'; // 兑换码兑换记录
}
