import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  constructor(private http: HttpClient) { }
  private readonly prefix = '/user/';

  /**
   * @description 获取用户封禁状态
   */
  readonly banStatus = () => this.http.get<{
    status: boolean
  }>(`${this.prefix}ban_status`);


}
