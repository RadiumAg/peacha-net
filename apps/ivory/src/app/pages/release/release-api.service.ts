import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Work } from '@peacha-core';
import { Observable } from 'rxjs';

export interface IPublishFileType {
	n: string;
	s: number;
	p: number;
	f: string;
	ft?: 1 | 2 | 3 | 4 | 5 | 99;
}

export interface IUpdateWork {
	i: number;
	n: string;
	f: string;
}
@Injectable({ providedIn: 'root' })
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
	 * @author zly
	 * @version 2021/4/22
	 * @param id 作品id
	 * @returns 在线作品详情
	 */
	getWork(id: number): Observable<Work> {
		return this.http.get<Work>(`/work/get_work?w=${id}`);
	}

	/**
	 *
	 * @name 发布作品
	 *
	 * @param  p n 作品名称，d 作品介绍 ，a 授权选项, g 模型预览文件，gd 预览模型参数， f 预览图， c 作品状态 原创，同人 ，t 标签，bv BV号，b  封面token， cs作品类型，gl 商品 作品详情 
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
		f: string[];
		gl: IPublishFileType[];
		gd?: string;
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
