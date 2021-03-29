import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class MemberApiService {
    constructor(private http: HttpClient) { }


    /************************** 作品管理  **************************/

    /**
     *
     * @name 作品管理
     *
     * @param  k  条件
     * @param  p  页码
     * @param  s  页大小
     * @param  c  商品类型（-1:全部;0:live2d;1:原画;2:3D模型）
     *
     * @author ding
     *
     * @description 创建作品
     *
     * @version 2021/3/15
     */
    public getCreateWork = (k: string, p: number, s: number, c: number) =>
        this.http.get<{
            count: number,
            list: {
                id: number,
                cover: string,
                name: string,
                userId: number,
                category: number,
                nickName: string,
                publishTime: number,
                time: number
            }[]
        }>(`/work/get_create_work?k=${k ?? ''}&p=${p ? p - 1 : 0}&s=${s}&c=${c}`)



    /**
    *
    * @name 获取申请的作品
    *
    * @param  k  条件
    * @param  p  页码
    * @param  s  页大小
    * @param  c  商品类型（-1:全部;0:live2d;1:原画;2:3D模型）
    * @param  a  商品类型（0:待审核;2:审核失败）
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public getApplyWork = (k: string, p: number, s: number, c: number, a: number) =>
        this.http.get<{
            count: number;
            list: {
                id: number;
                cover: string;
                name: string;
                category: number;
                auditResult: string;
                submitTime: string;
                auditTime: string;
                price: number
            }[];
        }>(`/work/get_apply_works?k=${k ?? ''}&p=${p ? p - 1 : 0}&s=${s}&c=${c}&a=${a}`)



    /**
    *
    * @name 获取作品数量
    *
    * @param  c  商品类型（-1:全部;0:live2d;1:原画）
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public getCreateWorksCount = (c: number) =>
        this.http.get(`/work/get_create_works_count?c=${c}`)



    /**
    *
    * @name 取消申请
    *
    * @param  id  作品Id
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public cancelApply = (id: number) =>
        this.http.post('/work/cannel_apply', {
            w: id,
        })


    /**
    *
    * @name 删除作品
    *
    * @param  id  作品Id
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public deleteWork = (id: number) =>
        this.http.post('/work/delete_work', {
            w: id,
        })



    /**
    *
    * @name 删除申请
    *
    * @param  id  作品Id
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public deleteApply = (id: number) =>
        this.http.post('/work/delete_apply', {
            w: id,
        })



    /**
    *
    * @name 获取作品的商品列表
    *
    * @param  id  作品Id
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public getGoods = (id: number) =>
        this.http.get<{
            list: {
                id: number,
                name: string,
                maxStock: number,
                saleNumber: number,
                sellState: boolean
            }[]
        }>(`/work/get_goods?w=${id}`)


    /**
    *
    * @name 修改出售状态
    *
    * @param  g  商品Id
    * @param  ss  销售状态（0:下架; 1:上架）
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public updateSellstate = (g: number, ss: number) =>
        this.http.post('/work/update_sellstate', {
            g: g,
            ss: ss
        })




    /************************** 出售记录  **************************/


    /**
    *
    * @name 获取出售订单详情
    *
    * @param  id  订单Id
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public getSellOrderDetail = (id: number) =>
        this.http.get<{
            orderid: number,
            workid: number,
            work_name: string,
            cover: string,
            goodsid: number,
            goods_name: string,
            price: number,
            rate: number,
            rate_amount: number,
            share: number,
            amount: number,
            buyer_id: number,
            buyer_name: string,
            completetime: number,
            maxstock: number,
            category: number
        }>(`/mall/get_sell_order_detail?o=${id}`)


    /**
    *
    * @name 获取出售订单
    *
    * @param  k  搜索条件
    * @param  p  页码
    * @param  s  页大小
    * @param  c  类型(0:live2D 1:原画)
    *
    * @author ding
    *
    * @description 
    *
    * @version 2021/3/15
    */
    public getSellOrder = (k: string, p: number, s: number, c: number) =>
        this.http.get<{
            count: number,
            list: {
                orderid: number,
                workid: number,
                work_name: string,
                cover: string,
                buyerid: number,
                buyer_name: string,
                goodsid: number,
                goods_name: string,
                amount: number,
                completetime: number,
                type: number,
                sell_type: number
            }[]
        }>(`/mall/get_sell_order?k=${k ?? ''}&p=${p ? p - 1 : 0}&s=${s}&c=${c}`)
}