import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


type PayMentList = {
    id: number,
    buyerId: number,
    sellerId: number,
    remarks: string,
    payId: string,
    channel: string,
    createTime: number,
    completeTime: number,
    expressFee: number,
    discountAmount: number,
    amount: number,
    hasExpress: boolean,
    name: string,
    platform: string,
    serviceName: string,
    status: number,
    goods: {
        id: number,
        category: {
            id: number,
            name: string,
            jumpPage: string
        },
        name: string,
        sourceId: string,
        price: number,
        count: number,
        remarks: string,
        types: string,
        expressNumber: string,
        expressType: string
    }
};




@Injectable()
export class ShopMallApiService {
    constructor(private http: HttpClient) { }


    /**
     * @name 订单详情
     *
     * @param  orderId  订单Id
     *
     * @author ding
     *
     * @description
     *
     * @version 2021/2/24
     */
    public orderDetail = (o: string) =>
        this.http.get<PayMentList>(`/shopmall/orders/detail?o=${o}`)

    /**
     * @name 发起支付
     *
     * @param  orderId  订单Id
     *
     * @author ding
     *
     * @description
     *
     * @version 2021/2/23
     */
    public orderPay = (p: { o: number[], c?: number[] }) =>
        this.http.post<{ payId: number, pageRoute: string }>('/shopmall/orders/pay', p)




    /**
* @name 优惠券列表
*
* @param  sn  服务名称
* @param  p  页码
* @param  s  页大小
*
* @author ding
*
* @description
*
* @version 2021/2/23
*/
    public couponsList = (sn: string, p: number, s: number) =>
        this.http.get<{
            count: number,
            list: {
                id: number,
                name: string,
                createTime: number,
                expireTime: number,
                mutualExclusion: string,
                category: {
                    categoryId: number,
                    name: string
                }[],
                effect: {
                    maxDiscountAmount: number,
                    fullAmount: number,
                    type: number,
                    discountAmount: number,
                    discountRate: number
                }
            }[]
        }>(`/shopmall/coupons/list?sn=${sn}&e=false&p=${p}&s=${s}`)



    /**
* @name 订单商品详情
*
* @param  c  分类
* @param  soi  商品产生来源Id
* @param  t  状态 0待支付 1:待发货 2:交付中 3:待签收 4:待评价/完成 5:已评价 6:已失效 7:已退款
* @param  p  页码
* @param  s  页大小
*
* @author ding
*
* @description
*
* @version 2021/2/23
*/
    public goodsList = (c: string, soi: number, t: number, p: number, s: number) =>
        this.http.get<{
            count: number,
            list: PayMentList[]
        }>(`/shopmall/orders/goods/list?c=${c}&soi=${soi}&t=${t}&p=${p}&s=${s}`)

}