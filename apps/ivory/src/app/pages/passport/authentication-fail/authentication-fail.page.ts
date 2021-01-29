import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type Result = {
	result: number;
	real_name: string;
	card_no: string;
	remarks: string;
};
@Component({
	selector: 'ivo-authentication-fail',
	templateUrl: './authentication-fail.page.html',
	styleUrls: ['./authentication-fail.page.less'],
})
export class AuthenticationFailPage {
	constructor(private http: HttpClient) {}

	result$ = this.http.get<Result>('/real/info');
}
