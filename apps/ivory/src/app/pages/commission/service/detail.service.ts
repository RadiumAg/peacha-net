import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState, ModalService } from '@peacha-core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommissionDetail } from '../model/commission-detail';

@Injectable()
export class CommissionDetailService {
	@Select(UserState.id)
	id$: Observable<number>;

	detail: CommissionDetail;
	Registrationlist: {
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
			workList: {
				id: number;
				cover: string;
				category: number;
			}[];
		}[];
	};

	cid: number;

	id: number;

	currentNodeRate: number;

	day: number;

	commissionStatus$ = new BehaviorSubject(0);

	constructor(private router: Router, private modal: ModalService) {
		this.id$.subscribe(i => {
			this.id = i;
		});
	}

	/********************************* 企划 *******************************/

	/**存企划ID */
	setCommissionId(n: number) {
		this.cid = n;
	}

	/**存企划所需时长 */
	setCommissionDay(n: number) {
		this.day = n;
	}

	/**存企划详情 */
	setDetailValue(n: CommissionDetail) {
		this.detail = n;
		this.commissionStatus$.next(n.commission.status);
	}

	/**存当前节点的稿酬比例 */
	setCurrentNodeRate(n: number) {
		this.currentNodeRate = n;
	}

	/**取当前节点的稿酬比例 */
	getCurrentNodeRate() {
		return this.currentNodeRate;
	}

	/**取企划ID */
	getCommissionId() {
		return this.cid;
	}

	/**取企划时长 */
	getCommissionDay() {
		return this.day;
	}

	/**企划方是否超时未审核
	 *
	 * 企划所需时长超过10天，五天未审核则返回true
	 * 企划所需时长小于10天，三天未审核则返回true
	 */
	isSponsorTimeout() {
		if (this.day > 10) {
			if (new Date().getTime() - this.detail.commission.startTime > 5 * 24 * 60 * 60 * 1000) {
				return true;
			} else {
				return false;
			}
		} else {
			if (new Date().getTime() - this.detail.commission.startTime > 3 * 24 * 60 * 60 * 1000) {
				return true;
			} else {
				return false;
			}
		}
	}

	/**取企划截稿时间 */
	getCommissionLasttime() {
		return Number(this.detail?.commission.startTime) + Number(this.day) * 24 * 60 * 60 * 1000;
	}

	/**取企划详情 */
	getDetailValue() {
		return this.detail;
	}

	//企划方：返回值为1；模型师、画师：返回值为2
	getIdentity() {
		if (this.id === this.detail?.receiver.id && this.id != this.detail?.sponsor.id) {
			return 2;
		} else if (this.id != this.detail.receiver.id && this.id === this.detail.sponsor.id) {
			return 1;
		}
	}
}
