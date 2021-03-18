import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';



type Work = {
    count: number;
    list: {
        id: number;
        name: string;
        like_count: number;
        collect_count: number;
        publishtime: number;
        avatar: string;
        cover: string;
        category: number;
        price: number;
        userid: number;
        nickname: string;
        stock: number;
    }[];
};

type HotTag = {
    list: {
        name: string;
        color: string;
        id: number;
    }[];
};


type Banner = {
    name: string;
    imageurl: string;
    url: string;
}[];


type HotUser = {
    count: number;
    list: {
        uid: number;
        nickname: string;
        follow_state: number;
        avatar: string;
        description: string;
        like_count: number;
        num_followed: number;
        work_list: {
            id: number;
            cover: string;
            category: number;
        }[];
    }[];
};

@Injectable()
export class IndexApiService {

    constructor(
        private http: HttpClient
    ) { }



    /**
    *
    * @name 获取热门作品
    *
    * @param  p 页码
    * @param  s 页大小
    * @param  c 类型 -1:全部 0:Live2D 1:原画
    * @param  t 类型  0:作品 1:商品
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getHotWork = (p: number, s: number, c: number, t: number) => this.http.get<Work>(`/work/hot_work?p=${p}&s=${s}&c=${c}&t=${t}`)


    /**
    *
    * @name 获取热门标签
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getHotTag = () => this.http.get<HotTag>(`/work/hot_tag`)



    /**
    *
    * @name 获取标签搜索
    * 
    * @param  t 标签id
    * @param  p 页码
    * @param  s 页大小
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getTagSearch = (t: number, p: number, s: number) => this.http.get<Work>(`/work/tag_search?t=${t}&p=${p}&s=${s}`)



    /**
    *
    * @name 获取首页轮播图
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getIndexBanner = () => this.http.get<Banner>('/common/index_banner')


    /**
    *
    * @name 获取关注动态
    * 
    * @param  p 页码
    * @param  s 页大小
    * @param  k 名称搜索
    * @param  c 类型 -1:全部 0:Live2D 1:原画
    * @param  cd 此次获取时间戳
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getNewest = (p: number, s: number, k: string, c: number, cd: number) => this.http.get<Work>(`/work/follow?p=${p}&s=${s}&k=${k}&c=${c}&cd=${cd}`)

    /**
    *
    * @name 获取推荐作品列表
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getRecommendWork = () => this.http.get<Work>(`/work/recommend`)



    /**
    *
    * @name 获取公示期作品
    * 
    * @param  p 页码
    * @param  s 页大小
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getPublicWork = (p: number, s: number) => this.http.get<Work>(`/work/public_work?p=${p}&s=${s}`)


    /**
    *
    * @name 获取热门作者
    * 
    * @param  p 页码
    * @param  s 页大小
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/3/18
    */
    public getHotUser = (p: number, s: number) => this.http.get<HotUser>(`/user/hot_user?p=${p}&s=${s}`)

}