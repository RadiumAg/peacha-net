import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WorkDetail, Works } from '../model';

export enum OrderBy {
	Keyword,
	PublishTime,
	LikeCount,
}

export enum WorkCategory {
	All = -1,
	Live2d,
	Illust,
}

export enum WorkSale {
	All = -1,
	OnlyWork = 0,
	WithGoods = 1,
}

export enum DateDiff {
	Default = 0,
	Today = -1,
	LastWeek = -7,
	LastMonth = -30,
	LastThreeMonth = -90,
	LastHalfYear = -180,
	LastYear = -360,
}


/**
 * 2021/3/18
 * 获取作品列表返回数据类型统一使用  model/Works
 * by ding
 */
@Injectable()
export class WorkApiService {
	constructor(private http: HttpClient) { }

	getRecommentWork(): Observable<Works> {
		return this.http.get<Works>(`/work/recommend`);
	}

	getHotIllWork(): Observable<Works> {
		return this.http.get<Works>(`/work/hot_work?p=0&s=10&c=1`);
	}

	getHotLive2dWork(): Observable<Works> {
		return this.http.get<Works>(`/work/hot_work?p=0&s=10&c=0`);
	}

	getPublicWork(): Observable<Works> {
		return this.http.get<Works>(`/work/public_work?p=0&s=6`);
	}

	getHotGood(): Observable<Works> {
		return this.http.get<Works>(`/work/hot_goods?p=0&s=10`);
	}

	getFollowedNewestWork(): Observable<Works> {
		return this.http.get<Works>(`/news/newest?page=0&size=5`);
	}

	getWork(id: number): Observable<WorkDetail> {
		return this.http.get<WorkDetail>(`/work/get_work?w=${id}`);
	}

	getWorks(
		userId: number,
		page: number,
		pageSize: number,
		key: string,
		workSale: WorkSale,
		category: WorkCategory
	) {
		return this.http.get<{
			count: number;
			list: {
				id: number;
				name: string;
				likeCount: number;
				collectCount: number;
				publishTime: number;
				cover: string;
				category: number;
				userId: number;
				nickName: string;
				price: number;
				stock: number
			}[]
		}>('/work/get_works', {
			params: {
				u: `${userId}`,
				p: `${page - 1}`,
				s: `${pageSize}`,
				k: key,
				ws: `${workSale}`,
				c: `${category}`,
			},
		});
	}

	getRepresentWork(userId: number) {
		return this.http.get<{
			count: number;
			list: {
				id: number;
				name: string;
				likeCount: number;
				collectCount: number;
				publishTime: number;
				cover: string;
				category: number;
				userId: number;
				nickName: string;
				price: number;
				stock: number
			}[]
		}>('/work/get_represent_work', {
			params: {
				u: `${userId}`,
			},
		});
	}

	searchWork(
		key: string,
		page: number,
		pageSize: number,
		orderBy: OrderBy,
		category: WorkCategory,
		dateDiff: DateDiff
	): Observable<Works> {
		return this.http.get<Works>(`/work/search_work`, {
			params: {
				k: key,
				p: `${page - 1}`,
				s: `${pageSize}`,
				o: `${orderBy}`,
				c: `${category}`,
				dd: `${dateDiff}`,
			},
		});
	}
}
