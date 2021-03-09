import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExchangeApiSrevice {

  private readonly  baseUrl = '/link';

  readonly code = this.baseUrl + '/client/code'; // 兑换兑换码

  readonly userRate = '/user/rate';

  readonly code_uselog = this.baseUrl + '/client/code_uselog'; // 兑换码兑换记录
}
