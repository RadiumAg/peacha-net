import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class N7rApiService {
	constructor(private http: HttpClient) { }

	/**
	*
	* @name 商品列表
	*
	* @author ding
	*
	* @description
	*
	* @version 2021/4/7
   */
	public goodsList = () => this.http.get<{
		servers: {
			id: number;
			price: number;
			name: string;
		}[]
	}>(`/advance/goods_list`);


	/**
	*
	* @name 发起订单
	*
	* @author ding
	*
	* @description
	*
	* @version 2021/4/7
   */
	public createOrder = (
		detali: {
			g: number,
			m: number,
			pi: number,
			ci: number,
			coi: number,
			si: number,
			ad: string,
			ph: string,
			e: string,
			n: string
		}) => this.http.post(`/advance/create_order`, { detali });


	/**
	*
	* @name 商品列表
	*
	* @author ding
	*
	* @description
	*
	* @version 2021/4/7
   */
	public addressSelect = (
		detail: {
			pi: number,
			k: string,
			p: number,
			s: number
		}
	) => this.http.get<{
		list: {
			id: number;
			name: string;
		}[]
	}>(`/advance/address/select?pi=${detail.pi}&k=${detail.k}&p=${detail.p}&s=${detail.s}`);
}
