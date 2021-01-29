import { Commission } from './../model/commission';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommissionDetail } from '../model/commission-detail';

@Injectable()
export class CommissionApiService {
	constructor(private http: HttpClient) {}

	/**
	 *
	 * @name 获取企划方、接稿方身份
	 *
	 * @param  i  用户Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/18
	 */
	public getUser = (i: number) =>
		this.http.get<{
			avatar: string;
			banner: string;
			collect_count: number;
			description: string;
			follow_state: number;
			id: number;
			like_count: number;
			nickname: string;
			num_followed: number;
			num_following: number;
			role: { id: number; expiry: number }[];
		}>(`/user/get_user?i=${i}`);

	/**
	 * @name 上传文件
	 * @param f 文件流
	 * @author zly
	 * @version
	 */
	public uploadFile = (f: FormData) => this.http.post<{ token: string; url: string }>('/common/upload_file', f);

	/**================  约稿公共模块接口 =====================*/

	/**
	 *
	 * @name 企划状态
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/12/4
	 */
	public commissionStatus = (c: number) => this.http.get<{ status: number }>(`/commission/commission_status?c=${c}`);

	/**
	 *
	 * @name 企划详情
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public detail = (c: number) => this.http.get<CommissionDetail>(`/commission/detail?c=${c}`);

	/**
	 *
	 * @name 企划订单详情
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 *
	 */
	public orders = (c: number) =>
		this.http.get<{
			list: {
				id: number;
				amount: number;
				channel: string;
				type: number;
				createTime: number;
				completeTime: number;
				payId: number;
			}[];
		}>(`/commission/orders?c=${c}`);

	/**
	 *
	 * @name 企划结算详情
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/12/17
	 *
	 */
	public orderDetails = (c: number) =>
		this.http.get<{
			list: {
				expectRate: number;
				amount: number;
				rateType: number;
			}[];
		}>(`/commission/order_details?c=${c}`);

	/**
	 *
	 * @name 取消企划订单
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/12/14
	 *
	 */
	public cancelOrders = (c: number) =>
		this.http.post(`/commission/cancel_orders`, {
			c,
		});

	/**
	 * @name 报名列表
	 *
	 * @param  c  企划Id
	 * @param  p  页码(可选)
	 * @param  s  页大小(可选，不传默认页大小10)
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public registrationList = (c: number, p?: number, s?: number) =>
		this.http.get<{
			count: number;
			list: {
				userId: number;
				nickName: string;
				avatar: string;
				detail: {
					startTime: number;
					price: number;
					day: number;
					description: string;
				};
			}[];
		}>(`/commission/registration_list?c=${c}&p=${p ?? 0}&s=${s ?? 10}`);

	/**
	 * @name 取消应征/选定画师
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */

	public cancel = (c: number) =>
		this.http.post(`/commission/cancel`, {
			c,
		});

	/**
	 * @name 企划首页
	 *
	 * @param  c  类型  全部：-1   live2D（立绘绑定）：0    原画（立绘创作）：1
	 * @param  p  页码
	 * @param  s  页大小
	 * @param  k  关键字(可选)
	 * @param  mip  最小价格(可选)
	 * @param  map  最大价格(可选)
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */

	public homePage = (c: number, p: number, s: number, k: string, mip?: number, map?: number) =>
		this.http.get<{
			count: number;
			list: Commission[];
		}>(`/commission/home_page?c=${c}&p=${p}&s=${s}&k=${k ?? ''}${mip ? '&mip=' + mip : ''}${map ? '&map=' + map : ''}`);

	/**=================  约稿发起方模块接口  ================== */

	/**
	 * @name 发布原画企划(参数都必填)
	 *
	 * @param n 约稿标题
	 * @param de 整体构思  0:完整构思 1:大概构思（需画师构思） 2:画师只需按我构思 3:完成大致构思需探讨 4：没有想法，需画师给想法
	 * @param s 稿件保密  0:公开 1:约定公开 2:不公开
	 * @param sd 公开要求
	 * @param d 天数
	 * @param sp 价格最小值 *100
	 * @param mp 价格最大值 *100
	 * @param det 具体需求
	 * @param en 表情数量
	 * @param an 动作数量
	 * @param hi 高 像素
	 * @param wi 宽 像素
	 * @param spi 是否拆分 0需拆分 1无需拆分
	 * @param spr 拆分节点所占比率 [不需要则给0]
	 * @param f 附件Token
	 * @param ft 参考图片Token
	 * @param mc 修改次数
	 * @param fl 节点[仅自定义节点] {n:节点名称,r:比率}
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public publishIllustration = (
		n: string,
		de: number,
		s: number,
		sd: string,
		d: number,
		sp: number,
		mp: number,
		det: string,
		en: number,
		an: number,
		hi: number,
		wi: number,
		spi: number,
		spr: number,
		f: number,
		ft: Array<string>,
		mc: number,
		fl: [
			{
				n: string;
				r: string;
			}
		]
	) =>
		this.http.post('/commission/publish_illustration', {
			n,
			de,
			s: Number(s),
			sd,
			d,
			sp,
			mp,
			det,
			en,
			an,
			hi,
			wi,
			spi,
			spr,
			f,
			ft,
			mc,
			fl,
		});

	/**
	 * @name 发布Live2D企划(参数都必填)
	 *
	 * @param n 约稿标题
	 * @param s 稿件保密 0:公开 1:约定公开 2:不公开
	 * @param sd 公开要求
	 * @param d 天数
	 * @param sp 价格最小值 *100
	 * @param mp 价格最大值 *100
	 * @param det 具体需求
	 * @param en 表情数量
	 * @param an 动作数量
	 * @param spi 是否需要工程 0需工程 1无需工程
	 * @param spii 是否拆分 0是 1否
	 * @param f 附件Token
	 * @param ft 参考图片Token
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public publishLive2D = (
		n: string,
		s: number,
		sd: string,
		d: number,
		sp: number,
		mp: number,
		det: string,
		en: number,
		an: number,
		spi: number,
		spii: number,
		f: number,
		ft: Array<string>
	) =>
		this.http.post('/commission/publish_live2d', {
			n,
			s,
			sd,
			d,
			sp,
			mp,
			det,
			en,
			an,
			spi,
			spii,
			f,
			ft,
		});

	/**
	 * @name 设置企划状态
	 *
	 * @param  c  企划Id
	 * @param  s  状态（0:招募中 5:关闭 7:暂停招募）
	 *
	 * @author ding
	 *
	 * @description  将关闭企划和暂停招募企划接口合并
	 *
	 * @version 2020/11/13
	 */
	public setStatus = (c: number, s: number) =>
		this.http.post('/commission/set_status', {
			c,
			s,
		});

	/**
	 * @name 修改企划
	 *
	 * @param  c  企划Id
	 * @param  s  稿件保密 0:公开 1:约定公开 2:不公开
	 * @param  sd  公开要求
	 * @param  d  天数
	 * @param  sp  价格最小值
	 * @param  mp  价格最大值
	 * @param  det  具体需求
	 * @param  hi  高 像素(可选)
	 * @param  wi  宽 像素(可选)
	 * @param  f  附件Token(可选)
	 * @param  ft  参考图片Token(可选)
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public update = (
		c: number,
		s: number,
		sd: string,
		d: number,
		sp: number,
		mp: number,
		det: string,
		hi: number,
		wi: number,
		f: number,
		ft: Array<string>
	) =>
		this.http.post('/commission/update', {
			c,
			s,
			sd,
			d,
			sp,
			mp,
			det,
			hi: hi ?? '',
			wi: wi ?? '',
			f: f ?? '',
			ft: ft ?? [],
		});

	/**
	 * @name 选择约稿用户
	 *
	 * @param  u  用户Id
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public selectUser = (u: number, c: number) =>
		this.http.post('/commission/select_user', {
			u,
			c,
		});

	/**
	 * @name 创建订单（支付保障金）
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public createOrder = (c: number) =>
		this.http.post<{ pageRoute: string; payId: number }>('/commission/create_order', {
			c,
		});

	//     /**
	//   * @name 创建订单（增加稿酬）
	//   *
	//   * @param  c  企划Id
	//   * @param  a  金额
	//   *
	//   * @author ding
	//   *
	//   * @description
	//   *
	//   * @version 2020/11/25
	//   */
	//     public createTip = (
	//         c: number,
	//         a: number
	//     ) => this.http.post<{ trade_id: number }>('/commission/create_tip', {
	//         c,
	//         a
	//     })

	/**
	 * @name 延长时间
	 *
	 * @param  c  企划Id
	 * @param  d  天数
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public delayTime = (c: number, d: number) =>
		this.http.post('/commission/delay_time', {
			c,
			d,
		});

	/**
	 * @name 发起企划列表
	 *
	 * @param  t  类型 0：招募中 1:停止招募 2：进行中 3：已完成 4:中止 5：关闭
	 * @param  p  页码
	 * @param  s  页大小
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public launchList = (t: number, p: number, s: number) =>
		this.http.get<{
			count: number;
			list: Commission[];
		}>(`/commission/launch_list?t=${t}&p=${p}&s=${s}`);

	/**==============  约稿接稿方模块接口 ==================== */

	/**
	 * @name 报名列表
	 *
	 * @param  t  类型 0：报名中 1:进行中 2:已完成 3:中止 4:已失效
	 * @param  p  页码
	 * @param  s  页大小
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public signUpList = (t: number, p: number, s: number) =>
		this.http.get<{
			count: number;
			list: Commission[];
		}>(`/commission/sign_up_list?t=${t}&p=${p}&s=${s}`);

	/**
	 * @name 报名企划
	 *
	 * @param  c  企划Id
	 * @param  de  报名备注
	 * @param  d  所需时长
	 * @param  s  开始时间 （时间戳 毫秒）
	 * @param  p  所需酬金
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public signUp = (c: number, de: string, d: number, s: number, p: number) =>
		this.http.post(`/commission/sign_up`, {
			c,
			de,
			d,
			s,
			p,
		});

	/**=============  节点模块接口  ============== */

	/**
	 * @name 节点列表
	 *
	 * @param  c 企划ID
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/12/7
	 */
	public nodeList = (c: number) =>
		this.http.get<{
			list: {
				id: number;
				name: string;
				rate: number;
				status: number;
				type: number;
				fileType: number;
				rejectCount: number;
			}[];
		}>(`/commission/node/list?c=${c}`);

	/**
	 * @name 已修改次数
	 *
	 * @param  c 企划ID
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/12/11
	 */
	public nodeModifyCount = (c: number) => this.http.get<{ count: number }>(`/commission/node/modify_count?c=${c}`);

	/**
	 * @name 节点上传文件
	 *
	 * @param  n  节点Id
	 * @param  t  文件列表
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public nodeSubmit = (n: number, t: Array<string>) =>
		this.http.post(`/commission/node/submit`, {
			n,
			t,
		});

	/**
	 * @name 节点审核
	 *
	 * @param  n  节点Id
	 * @param  s  0:确认无误 1:驳回 2:修改
	 * @param  d  驳回理由
	 * @param  t  文件列表
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public nodeAudit = (n: number, s: number, d?: string, t?: Array<string>) =>
		this.http.post(`/commission/node/audit`, {
			n,
			s,
			d,
			t,
		});

	/**
	 * @name 节点列表提交
	 *
	 * @param  n  节点Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public nodeSubmitRecords = (n: number) =>
		this.http.get<{
			list: {
				id: number;
				submitFiles: Array<string>;
				submitTime: number;
				status: number;
				audit: {
					auditTime: number;
					images: Array<string>;
					description: string;
				};
				appeal: {
					applyTime: number;
					auditTime: number;
					status: number;
					auditDescription: string;
				};
			}[];
		}>(`/commission/node/submit_records?n=${n}`);

	/**
	 * @name 商家发起确认企划
	 *
	 * @param  n  第一个节点Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public launchConfirm = (n: number) =>
		this.http.post('/commission/node/launch_confirm', {
			n,
		});

	/**
	 * @name 画师确认企划
	 *
	 * @param  n  第一个节点Id
	 * @param  s  0:确认无误 1:驳回（拒绝）
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public confirmCommission = (n: number, s: number) =>
		this.http.post(`/commission/node/confirm_commission`, {
			n,
			s,
		});

	/**=============  增加稿酬模块接口  ================== */

	/**
	 * @name 创建增加稿酬申请
	 *
	 * @param  c  企划Id
	 * @param  a  金额
	 * @param  d  描述
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/27
	 */
	public createTips = (c: number, a: number, d: string) =>
		this.http.post<{ trade_id: number }>(`/commission/create_tips`, {
			c,
			a,
			d,
		});

	/**
	 * @name 审核稿酬申请
	 *
	 * @param  t  申请Id
	 * @param  s  1：通过；2：拒绝
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/27
	 */
	public auditTips = (t: number, s: number) =>
		this.http.post<{ payId: number; pageRoute: number }>(`/commission/audit_tips`, {
			t,
			s,
		});

	/**
	 * @name 增加稿酬列表
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/27
	 */
	public tipsList = (c: number) =>
		this.http.get<{
			list: {
				id: number;
				amount: number;
				completeTime: number;
				status: number;
				applyTime: number;
				description: string;
			}[];
		}>(`/commission/tips_list?c=${c}`);

	/**=============  中止模块接口  ================== */

	/**
	 * @name 申诉（只能申请最后一个节点的最新一次提交）
	 *
	 * @param  c  企划Id
	 * @param  d  描述(可选)
	 * @param  f  文件token列表
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/26
	 */
	public nodeAppeal = (c: number, d?: string, f?: Array<string>) =>
		this.http.post(`/commission/node/appeal`, {
			c,
			d,
			f,
		});

	/**
	 * @name 中止企划申请
	 *
	 * @param  c  企划Id
	 * @param  t  0:协商 1:强行中止 2:申请官方协助 3:超时中止
	 * @param  r  稿费比率(可选)
	 * @param  d  描述(可选)
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public discontinue = (c: number, t: number, r?: number, d?: string) =>
		this.http.post(`/commission/discontinue`, {
			c,
			t,
			r,
			d,
		});

	/**
	 * @name 是否确认中止企划申请
	 *
	 * @param  c  申请Id
	 * @param  s  1:通过 2:拒绝
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public discontinueConfirm = (c: number, s: number) =>
		this.http.post(`/commission/discontinue/confirm`, {
			c,
			s,
		});

	/**
	 * @name 中止记录
	 *
	 * @param  c  企划Id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/6
	 */
	public discontinueList = (c: number) =>
		this.http.get<{
			list: {
				id: number;
				applyTime: number;
				replyTime: number;
				price: number;
				rate: number;
				userId: number;
				type: number;
				status: number;
				description: string;
				replyDescription: string;
			}[];
		}>(`/commission/discontinue/list?c=${c}`);

	/**
	 * @name 中止后上传源文件
	 *
	 * @param  c  企划id
	 * @param  t  文件token列表
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/26
	 */
	public discontinueSubmitFile = (c: number, t: Array<string>) =>
		this.http.post(`/commission/discontinue/submit_file`, {
			c,
			t,
		});

	/**
	 * @name 中止后源文件审核
	 *
	 * @param  c  申请id
	 * @param  s  1:成功 2：驳回
	 * @param  d  驳回理由
	 * @param  t  文件token列表
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/26
	 */
	public discontinueAuditFile = (c: number, s: number, d?: string, t?: Array<string>) =>
		this.http.post(`/commission/discontinue/audit_file`, {
			c,
			s,
			d,
			t,
		});

	/**
	 * @name 中止后源文件提交记录
	 *
	 * @param  c  企划id
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/26
	 */
	public discontinueFileRecords = (c: number) =>
		this.http.get<{
			list: {
				id: number;
				submitFiles: Array<string>;
				submitTime: number;
				status: number;
				audit: {
					auditTime: number;
					images: Array<string>;
					description: string;
				};
			}[];
		}>(`/commission/discontinue/file_records?c=${c}`);

	/**
	 * @name 用户作品
	 *
	 * @param  u  用户id列表
	 *
	 * @author ding
	 *
	 * @description
	 *
	 * @version 2020/11/13
	 */
	public userWorks = (u: string) =>
		this.http.get<{
			list: {
				userid: number;
				list: {
					id: number;
					cover: string;
					category: number;
				}[];
			}[];
		}>(`/work/user_works?u=${u}`);
}
