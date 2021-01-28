import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ivo-authentication-success',
  templateUrl: './authentication-success.page.html',
  styleUrls: ['./authentication-success.page.less'],
})
export class AuthenticationSuccessPage {
  constructor(private http: HttpClient) {}

  info$ = this.http.get<{
    result: number;
    real_name: string;
    card_no: string;
  }>('/real/info');
}
