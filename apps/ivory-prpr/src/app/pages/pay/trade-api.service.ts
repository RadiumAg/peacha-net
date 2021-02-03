import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TradeInfo } from './trade';




@Injectable()
export class TradeApiService {
    constructor(private http: HttpClient) { }

    // #region pay

    /**
     * @author kinori
     * @param {number} type 支付：0 转账：1
     * @memberof TradeApiService
     * @description 获取交易渠道列表
     */
    channelList = (type: 0 | 1) =>
        this.http.get<{
            list: {
                id: number;
                name: string;
                isEnable: boolean;
                channelParamsDefines: {
                    key: string;
                    show: string;
                    tips: string;
                }[];
            }[];
            count: number;
        }>('/api/v1/trade/channel/list', {
            params: {
                type: type.toString(),
            },
        });

    /**
     * @author kinori
     * @param {number} id 支付ID
     * @memberof TradeApiService
     * @description 支付流程中，获取支付信息
     */
    payInfo = (id: number) =>
        this.http.get<TradeInfo>('/api/v1/trade/pay/info', {
            params: {
                id: id.toString(),
            },
        });

    /**
     * @author kinori
     * @param {number} channelId
     * @param {number} payId
     * @memberof TradeApiService
     * @description 支付流程中，选择支付渠道
     */
    payCashierLaunch = (channelId: number, payId: number) =>
        this.http.get<{
            channelId: number;
            page: string;
        }>('/api/v1/trade/pay/cashier/launch', {
            params: {
                channelId: channelId.toString(),
                payId: payId.toString(),
            },
        });

    /**
     * @author kinori
     * @param {number} id
     * @memberof TradeApiService
     * @description 支付流程中，支付心跳
     */
    payHeartbeat = (id: number) =>
        this.http.get<{
            status: number;
            cashiers: {
                status: number;
                error: string;
                channelId: number;
            }[];
            error: string;
        }>('/api/v1/trade/pay/heartbeat', {
            params: {
                id: id.toString(),
            },
        });

    /**
     * @author kinori
     * @param {number} id
     * @memberof TradeApiService
     * @description 支付流程中，关闭支付
     */
    payClose = (id: number) =>
        this.http.get('/api/v1/trade/pay/close', {
            params: {
                id: id.toString(),
            },
        });

    // #endregion

    // #region wallet

    /**
     *
     *
     * @param {number} m 时间戳
     * @param {number} p 页数
     * @param {number} s 每页数量
     * @memberof TradeApiService
     */
    queryWalletBill = (m: Date, p: number, s: number) =>
        this.http.get<any>('/api/v1/trade/query/wallet/bill', {
            params: {
                m: formatDate(m, 'yyyy-MM-dd', 'zh-cn'),
                p: (p ? p - 1 : 0).toString(),
                s: s.toString()
            },
        });

    /**
     * @author saber
     * @param {number} id
     * @memberof TradeApiService
     */
    queryWalletCashout = (id: number) =>
        this.http.get<any>(`/api/v1/trade/query/wallet/cashout`, {
            params: {
                id: id.toString()
            }
        })

    /**
     *
     *
     * @param {number} id
     * @memberof TradeApiService
     */
    queryPayDetails = (id: number) =>
        this.http.get(`/api/v1/trade/query/pay/details`, {
            params: {
                id: id.toString()
            }
        })
    // #endregion
}
