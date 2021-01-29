import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Work } from '@peacha-core';

@Injectable()
export class ReleaseApiService {
	constructor(private http: HttpClient) {}

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
	public get_edit_work = (w: number) => this.http.get<Work>(`/work/get_edit_work?w=${w}`);

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
	public publish_work = (p: {
		n: string;
		d: string;
		a: number;
		b: string;
		t: string;
		c: number;
		cs: number;
		ss: number;
		f: [];
		gl: [];
	}) => this.http.post(`/work/publish_work`, p);

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
	public update_work = (p: {
		w: number;
		n: string;
		d: string;
		g?: string;
		i: any[];
		t: string;
		b: string;
		gl: any[];
		a?: Array<number>;
		fr?: number;
		gd?: string;
		dg?: any[];
	}) => this.http.post(`/work/update_work`, p);
}
