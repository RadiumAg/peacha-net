import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

interface Work {
	id: number;
	name: string;
	likeCount: number;
	collectCount: number;
	publishTime: number;
	avatar: string;
	cover: string;
	category: number;
	price: number;
	userId: number;
	nickName: string;
	stock: number;
}

export interface WorkDetail {
	id: number;
	name: string;
	category: number;
	file: string;
	file_data: string;
	file_size: number;
	publishtime: number;
	updatetime: number;
	copyright: number;
	cover: string;
	authority: number[];
	tag: {
		id: number;
		name: string;
	};
	assets: string[];
	author_id: number;
	author_name: string;
	author_avatar: string;
	follow_state: number;
	like_count: number;
	is_like: number;
	collect_count: number;
	is_collect: number;
	share_count: number;
	description: string;
	comment_areaid: number;
	comment_count: number;
	goods: [
		{
			id: number;
			name: string;
			max_stock: number;
			file_size: number;
			sale_number: number;
			publishtime: number;
			price: number;
			sell_state: number;
			own_state: number;
		}
	];
}

interface WorkList {
	count: number;
	list: Work[];
}

@Injectable()
export class WorkApiService {
	constructor(private http: HttpClient) { }

	getRecommentWork(): Observable<{
		count: number;
		list: Work[];
	}> {
		return this.http.get<WorkList>(`/work/recommend`);
	}

	getHotIllWork(): Observable<WorkList> {
		return this.http.get<WorkList>(`/work/hot_work?p=0&s=10&c=1`);
	}

	getHotLive2dWork(): Observable<WorkList> {
		return this.http.get<WorkList>(`/work/hot_work?p=0&s=10&c=0`);
	}

	getPublicWork(): Observable<WorkList> {
		return this.http.get<WorkList>(`/work/public_work?p=0&s=6`);
	}

	getHotGood(): Observable<WorkList> {
		return this.http.get<WorkList>(`/work/hot_goods?p=0&s=10`);
	}

	getFollowedNewestWork(): Observable<WorkList> {
		return this.http.get<WorkList>(`/news/newest?page=0&size=5`);
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
	): Observable<WorkList> {
		return this.http.get<WorkList>('/work/get_works', {
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

	getRepresentWork(userId: number): Observable<WorkList> {
		return this.http.get<WorkList>('/work/get_represent_work', {
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
	): Observable<WorkList> {
		return this.http.get<WorkList>(`/work/search_work`, {
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
