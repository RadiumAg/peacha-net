import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class MessageApiService {

    constructor(
        private http: HttpClient
    ) { }

    /**
    *
    * @name 上报已读的通知
    *
    * @param  noticeIds 通知id数组
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/1/20
   */
    public read = (noticeIds: Array<number>) => this.http.post(`/notice/handle/read`, { noticeIds });


    /**
*
* @name 全部已读
*
* @param  platform 通知展示平台
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public allRead = (platform: string) => this.http.post(`/notice/handle/read/all`, { platform });


    /**
*
* @name 删除通知
*
* @param  noticeId 通知id
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public delete = (noticeId: number) => this.http.post(`/notice/handle/delete`, { noticeId });


    /**
*
* @name 删除某一类下的所有通知
*
* @param  defineId 通知定义id
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public deleteAll = (defineId: number) => this.http.post(`/notice/handle/delete/all`, { defineId });

    /**
*
* @name 设置通知的提醒和推送
*
* @param  setupList 通设置列表
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public setup = (list: Array<{ platform: string, remind: boolean }>) => this.http.post(`/notice/handle/setup`, { list });


    /**
*
* @name 获取未读通知数量
*
* @param  pms 通知展示平台
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public getUnreadCount = (pms: Array<string>) => this.http.get<{ list: Array<{ platform: string, count: number }> }>(`/notice/query/unread/count`, {
        params: {
            pms
        }
    })



    /**
*
* @name 查询通知列表
*
* @param  pm 通知定义id数组
* @param  p 页码
* @param  s 页大小
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public getQueryList = (pm: string, p: number, s: number, b?: boolean) => this.http.get<
        {
            count: number,
            page: number,
            size: number,
            list: Array<{
                noticeId: number,
                defineId: number,
                publisher: number,
                time: number,
                content: any,
                isRead: boolean
            }>
        }>(`/notice/query/list?pm=${pm}&p=${p}&s=${s}&b=${b ?? false}`)


    /**
*
* @name 查询通知设置
*
* @param  pms 通知定义id数组
*
* @author ding
*
* @description
*
* @version 2021/1/20
*/
    public querySetting = (pms: Array<string>) => this.http.get<
        {
            list: Array<{
                platform: string,
                remind: boolean
            }>
        }>(`/notice/query/setting`, {
            params: {
                pms
            }
        })
}
