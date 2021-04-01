import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Work } from '@peacha-core';

export interface IPublishFileType {
	n: string;
	s: number;
	p: number;
	f: string;
	ft: 1 | 2 | 3 | 4 | 5 | 99;
}

export interface IUpdateWork {
	i: number;
	n: string;
	f: string;
}
@Injectable()
export class ReleaseApiService {
	constructor(private http: HttpClient) { }

	/**
	 *
	 * @name 版权信息
	 *
	 * @param  c  作品状态 0:live2D 1:原画
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2021/1/4
	 */
	public copyright = (c: number) =>
		this.http.get<{
			list: Array<{
				id: number;
				name: string;
			}>;
		}>(`/work/copyright?c=${c}`);

	/**
	 *
	 * @name 获取单个作品（用于编辑）
	 *
	 * @param  w  作品Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2021/1/4
	 */
	public getEditWork = (w: number) => this.http.get<Work>(`/work/get_edit_work?w=${w}`);

	/**
	 *
	 * @name 发布作品
	 *
	 * @param  p  作品详情
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2021/1/4
	 */
	public publishWork = (p: {
		n: string;
		d: string;
		a: number[];
		b: string;
		t: string;
		c: number;
		cs: number;
		ss: number;
		f: string[];
		gl: IPublishFileType[];
		g?: string;
		bv?: string;
	}) => this.http.post(`/work/publish_work`,p);

	/**
	 *
	 * @name 修改作品
	 *
	 * @param  p  作品详情
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2021/1/4
	 */
	public updateWork = (p: {
		w: number;
		n: string;
		d: string;
		t: string;
		b: string;
		gl: IUpdateWork[];
		i?: string[];
		g?: string;
		bv?: string;
		gd?: string;
	}) => this.http.post(`/work/update_work`,p);


	/**
	 * @description 更新价格
	 *  
	 * @param param g 商品, p 价格
	 */
	public updatePrice = (param: { g: number; p: number; }) => this.http.post(`/work/update_price`,param);
}
