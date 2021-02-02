import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { UserState, ModalService, ChatStartService, Toast } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { Observable, combineLatest, Subject, fromEvent } from 'rxjs';
import { tap, takeUntil, shareReplay, take, debounceTime } from 'rxjs/operators';
import { CommissionDetail } from '../model/commission-detail';
import { CommissionApiService } from '../service/commission-api.service';
import { CommissionDetailService } from '../service/detail.service';
import { CommissionDetailErrorService } from './commission-detail-error.service';
import { CommissionOvertime } from './commission-pop-component/commission-overtime/commission-overtime';
import { CommissionPainter } from './commission-pop-component/commission-painter/commission-painter';
import { CommissionRegistration } from './commission-pop-component/commission-registration/commission-registration';
import { CommissionTimeout } from './commission-pop-component/commission-timeout/commission-timeout';

@Component({
	templateUrl: './commission-detail.component.html',
	styleUrls: ['./commission-detail.component.less'],
})
export class CommissionDetailComponent implements OnInit, OnDestroy {
	@Select(UserState.id)
	id$: Observable<number>;

	@Select(UserState.role)
	role$: Observable<Array<{ id: number; expiry: number }>>;

	commissionId: number;

	commissionStatus$ = this.detailState.commissionStatus$;

	detail: CommissionDetail;

	finalPrice: number;

	sponsor: {
		id: number;
		avatar: string;
		nickname: string;
		role: {
			id: number;
			expiry: number;
		}[];
	};
	receiver: {
		id: number;
		avatar: string;
		nickname: string;
		role: {
			id: number;
			expiry: number;
		}[];
	};

	// 是否报名
	isRegistration: boolean;
	// 报名人数
	registrationCount = 0;

	// 企划所需时长
	commissionDay = 0;

	// 企划截稿时间
	lasttime = 0;
	// 身份
	Identity: number;
	// 控制企划详情左边显示(true:显示有接稿方信息的样式)
	isHideLeft = false;

	nowTime = new Date().getTime();

	// 用于刷新详情左边显示
	params$ = combineLatest([this.route.queryParams, this.commissionStatus$]).pipe(
		tap(([p, status]) => {
			console.log(status);
			if (status != 7 && status != 0 && status != 5) {
				this.isHideLeft = true;
				if (Number(p.receiverid) > 0) {
					this.getReceiverRole(p.receiverid);
				}
				// this.cdr.detectChanges();
			} else {
				console.log('false');
				this.isHideLeft = false;
				// this.cdr.detectChanges();
			}
		})
	);

	btnIconList: Array<any> = [];

	showTime: string;

	showBtn = [
		{
			i: '/assets/image/commission/money.svg',
			hover: '/assets/image/commission/money-hover.svg',
			word: ['增加稿酬'],
			a: 0,
		},
		{
			i: '/assets/image/commission/add.svg',
			hover: '/assets/image/commission/add-hover.svg',
			word: ['延长截稿时间'],
			a: 1,
		},
		{
			i: '/assets/image/commission/timeout.svg',
			hover: '/assets/image/commission/timeout-hover.svg',
			word: ['超时规则'],
			a: 2,
		},
		{
			i: '/assets/image/commission/close.svg',
			hover: '/assets/image/commission/close-hover.svg',
			word: ['中止约稿/记录', '取消企划'],
			a: 3,
		},
		{
			i: '/assets/image/commission/note.svg',
			hover: '/assets/image/commission/note-hover.svg',
			word: ['支付/退款记录', '收入记录'],
			a: 4,
		},
		{
			i: '/assets/image/commission/service.svg',
			hover: '/assets/image/commission/service-hover.svg',
			word: ['联系客服'],
			a: 5,
		},
	];

	constructor(
		private model: ModalService,
		private cdr: ChangeDetectorRef,
		private commissionApi: CommissionApiService,
		private detailState: CommissionDetailService,
		private router: Router,
		private route: ActivatedRoute,
		private isError: CommissionDetailErrorService,
		private chat: ChatStartService,
		private toast: Toast
	) { }

	destroy$ = new Subject<void>();
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.unsubscribe();
	}
	select(): void {
		this.showBtn.map(l => {
			if (l.a === 4) {
				if (this.Identity === 1) {
					return (l.word = [l.word[0]]);
				} else {
					return (l.word = [l.word[1]]);
				}
			}
			if (l.a === 3) {
				if (Number(this.commissionStatus$.value) === 1 || Number(this.commissionStatus$.value) === 0) {
					return (l.word = [l.word[1]]);
				} else {
					return (l.word = [l.word[0]]);
				}
			}
		});
	}

	getSponsorRole(id: number): void {
		this.commissionApi.getUser(id).subscribe(s => {
			// let res = s.role.filter(function (item, index, self) {
			//   return self.findIndex(el => el.id == item.id) === index;
			// })
			const res = [];
			s.role.forEach(l => {
				res.push(l.id);
			});
			this.sponsor = { ...s, role: res };
			this.cdr.detectChanges();
		});
	}

	getReceiverRole(id: number): void {
		this.commissionApi.getUser(id).subscribe(s => {
			// let res = s.role.filter(function (item, index, self) {
			//   return self.findIndex(el => el.id == item.id) === index;
			// });
			const res = [];
			s.role.forEach(l => {
				res.push(l.id);
			});
			this.receiver = { ...s, role: res };
			this.cdr.detectChanges();
		});
	}

	ngOnInit(): void {
		this.params$.pipe(takeUntil(this.destroy$)).subscribe();

		this.detail = this.detailState.getDetailValue();
		this.lasttime = this.detailState.getCommissionLasttime();
		this.Identity = this.detailState.getIdentity();
		this.commissionDay = this.detailState.getDetailValue().commission.day;
		this.commissionId = this.detailState.getCommissionId();

		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(p => {
			if (p.money) {
				this.finalPrice = p.money;
			} else {
				this.finalPrice = this.detailState.getDetailValue().commission.finalPrice;
			}
		});

		this.select();
		// 获取发起方身份
		if (this.detailState.detail.sponsor.id > 0) {
			this.getSponsorRole(this.detailState.detail.sponsor.id);
		}

		// 获取接稿方身份
		if (this.detailState.detail.receiver.id > 0) {
			this.getReceiverRole(this.detailState.detail.receiver.id);
			this.isHideLeft = true;
		}

		this.commissionApi.registrationList(this.detailState.getCommissionId(), 0).subscribe(s => {
			this.registrationCount = s.count;
			this.id$.subscribe(id => {
				if (s.list.findIndex(i => i.userId === id) > -1) {
					this.isRegistration = true;
				} else {
					this.isRegistration = false;
				}

				this.changeBtn();
			});
		});

		this.remainingTime(this.detail.commission.expireTime);
	}

	changeBtn(): void {
		this.commissionStatus$.pipe(shareReplay(1)).subscribe(status => {
			if (status != 5) {
				this.id$.subscribe(id => {
					if (this.detail.sponsor.id === id) {
						if (status === 7 && this.detail.commission.expireTime < this.nowTime) {
							this.btnIconList = [
								{
									text: '编辑企划',
									fun: 1,
									i: '/assets/image/commission/edit.svg',
								},
								{
									text: '关闭企划',
									fun: 2,
									i: '/assets/image/commission/close-commission.svg',
								},
							];
						} else {
							if (status === 7) {
								this.btnIconList = [
									{
										text: '编辑企划',
										fun: 1,
										i: '/assets/image/commission/edit.svg',
									},
									{
										text: '开启招募',
										fun: 3,
										i: '/assets/image/commission/stop-commission.svg',
									},
									{
										text: '关闭企划',
										fun: 2,
										i: '/assets/image/commission/close-commission.svg',
									},
								];
							} else if (status != 7) {
								this.btnIconList = [
									{
										text: '编辑企划',
										fun: 1,
										i: '/assets/image/commission/edit.svg',
									},
									{
										text: '停止招募',
										fun: 4,
										i: '/assets/image/commission/stop-commission.svg',
									},
									{
										text: '关闭企划',
										fun: 2,
										i: '/assets/image/commission/close-commission.svg',
									},
								];
							}
						}
					} else {
						if (!this.isRegistration && this.detail?.commission?.expireTime > this.nowTime) {
							this.btnIconList = [
								{
									text: '报名企划',
									fun: 5,
									i: '/assets/image/commission/registrate.svg',
								},
							];
						} else if (this.isRegistration) {
							this.btnIconList = [
								{
									text: '取消报名',
									fun: 6,
									i: '/assets/image/commission/cancel-registrate.svg',
								},
							];
						}
					}
				});
			} else {
				this.btnIconList = [];
			}

			this.cdr.detectChanges();
		});
	}

	/**计算距离关闭应征的时间 */
	remainingTime(t: number): void {
		const time = t - new Date().getTime();
		const day = Math.floor(time / 1000 / 60 / 60 / 24);
		const h = Math.floor((time - day * 1000 * 60 * 60 * 24) / 1000 / 60 / 60);
		const m = Math.floor((time - day * 1000 * 60 * 60 * 24 - h * 1000 * 60 * 60) / 1000 / 60);
		this.showTime = day + ' 天 ' + h + ' 小时 ' + m + ' 分钟';
	}

	/**停止企划 */
	stopCommission(): void {
		this.model
			.open(PopTips, ['确定要停止招募企划吗？', true])
			.afterClosed()
			.subscribe(i => {
				if (i) {
					this.commissionApi.setStatus(this.detailState.getCommissionId(), 7).subscribe(
						_ => {
							this.commissionApi.commissionStatus(this.detailState.getCommissionId()).subscribe(s => {
								this.detailState.commissionStatus$.next(s.status);
								this.changeBtn();
							});
						},
						e => {
							this.isError.ifError(e.code);
						}
					);
				}
			});
	}

	/**开启企划 */
	startCommission(): void {
		this.commissionApi.setStatus(this.detailState.getCommissionId(), 0).subscribe(
			_ => {
				this.commissionApi.commissionStatus(this.detailState.getCommissionId()).subscribe(s => {
					this.detailState.commissionStatus$.next(s.status);
					this.changeBtn();
				});
			},
			e => {
				this.isError.ifError(e.code);
			}
		);
	}

	/**关闭企划 */
	closeCommission(): void {
		this.model
			.open(PopTips, ['确定要关闭企划吗？', true])
			.afterClosed()
			.subscribe(i => {
				if (i) {
					this.commissionApi.setStatus(this.detailState.getCommissionId(), 5).subscribe(
						_ => {
							this.commissionApi.commissionStatus(this.detailState.getCommissionId()).subscribe(s => {
								this.detailState.commissionStatus$.next(s.status);
								this.changeBtn();
							});
						},
						e => {
							this.isError.ifError(e.code);
						}
					);
				}
			});
	}

	/**报名企划 */
	registration(): void {
		this.role$.pipe(take(1)).subscribe(s => {
			if (this.detail.commission.category === 1) {
				if (s.findIndex(l => l.id === 11002) > -1) {
					this.goToRegistration();
				} else {
					this.model
						.open(PopTips, ['您还未完成画师认证，无法报名此企划，请前往认证！', false])
						.afterClosed()
						.subscribe(_ => {
							this.router.navigate(['/setting/security']);
						});
				}
			} else {
				if (s.findIndex(l => l.id === 11001) > -1) {
					this.goToRegistration();
				} else {
					this.model
						.open(PopTips, ['您还未完成模型师认证，无法报名此企划，请前往认证！', false])
						.afterClosed()
						.subscribe(_ => {
							this.router.navigate(['/setting/security']);
						});
				}
			}
		});
	}

	/**前往报名企划弹框 */
	goToRegistration(): void {
		this.model
			.open(CommissionRegistration, 0)
			.afterClosed()
			.subscribe(i => {
				if (i) {
					this.commissionApi
						.signUp(
							this.detailState.getCommissionId(),
							i[1].tips,
							i[1].time,
							new Date(i[1].start_year + '/' + i[1].start_month + '/' + i[1].start_day).getTime(),
							i[1].money / 10
						)
						.subscribe(
							_ => {
								// this.id$.subscribe(i => {
								//   // this.getWorkList([i]);
								// });
								// 若当前路由在报名列表详情，renovate用于重新请求报名列表
								this.router.navigate([], {
									queryParams: {
										renovate: 1,
										id: this.detailState.getCommissionId(),
									},
									queryParamsHandling: 'merge',
								});

								this.isRegistration = true;
								this.registrationCount = this.registrationCount + 1;
								this.changeBtn();
								this.cdr.detectChanges();
							},
							e => {
								if (e.code === 404) {
									this.model.open(PopTips, ['该企划目前无法报名！', false]);
								} else if (e.code === 403) {
									this.model.open(PopTips, ['您还未完成画师/模型师认证，无法报名此企划，请前往认证！', false]);
								}
							}
						);
				}
			});
	}

	/**取消报名企划 */
	canceRegistration(): void {
		this.model
			.open(CommissionPainter, {
				type: 1,
				identity: this.Identity ?? 0,
				category: this.detail.commission.category,
			})
			.afterClosed()
			.subscribe(i => {
				if (i) {
					this.commissionApi.cancel(this.detailState.getCommissionId()).subscribe(
						_ => {
							// this.commissionApi.commissionStatus(this.detailState.getCommissionId()).subscribe(s => {
							//   this.detailState.commissionStatus$.next(s.status);
							// })
							this.detailState.commissionStatus$.next(7);
							this.router.navigate(['/commission/detail'], {
								queryParams: {
									receiverid: -1,
								},
								queryParamsHandling: 'merge',
							});
							this.isRegistration = false;
							this.changeBtn();
						},
						e => {
							this.isError.ifError(e.code);
						}
					);
				}
			});
	}

	/**增加稿酬 */
	addMoney(): void {
		this.router.navigate(['/commission/detail/createtip'], {
			queryParams: {
				id: this.detailState.getCommissionId(),
			},
		});
	}

	/**延长企划时间 */
	overtime(): void {
		if ([1, 2, 4].includes(this.detailState.commissionStatus$.value)) {
			this.model
				.open(CommissionOvertime)
				.afterClosed()
				.subscribe(i => {
					if (i) {
						this.commissionApi.delayTime(this.detailState.getCommissionId(), i).subscribe(
							_s => {
								this.detailState.setCommissionDay(this.detailState.getCommissionDay() + i);
								this.commissionDay = this.commissionDay + Number(i);
								this.lasttime = this.lasttime + Number(i) * 24 * 60 * 60 * 1000;
								this.cdr.detectChanges();
							},
							e => {
								this.isError.ifError(e.code);
							}
						);
					}
				});
		} else {
			this.model.open(PopTips, ['企划已完成，无法操作', false]);
		}
	}

	/**发起私聊 */
	toChat(id: number, avatar: string, nickname: string): void {
		this.id$.subscribe(i => {
			this.chat.openNewRoom(id, i, nickname, avatar);
		});
	}

	/**编辑企划 */
	edit(): void {
		this.router.navigate(
			[this.detailState.getDetailValue().commission.category === 0 ? '/commission/publish/live2d' : '/commission/publish/illust'],
			{
				queryParams: {
					cid: this.detailState.getCommissionId(),
				},
			}
		);
	}
	/**超时规则 */
	timeout(): void {
		this.model.open(CommissionTimeout, { type: -1, id: 0 });
	}

	/**退款记录 */
	paynote(): void {
		this.router.navigate(['commission/detail/payment'], {
			queryParams: {
				id: this.detailState.getCommissionId(),
			},
		});
	}

	/**联系客服 */
	chatwithcustomer(): void {
		this.router.navigate(['/message/customer-service']);
	}

	/**中止企划/记录 */
	discontinue(): void {
		if (Number(this.detail.commission.status) === 1 || Number(this.detail.commission.status) === 0) {
			this.canceRegistration();
		} else {
			this.router.navigate(['commission/detail/discontinue'], {
				queryParams: {
					id: this.detailState.getCommissionId(),
				},
			});
		}
	}

	changeState(el: HTMLElement): void {
		const a = el.getBoundingClientRect();
		fromEvent(el, 'click')
			.pipe(take(1), debounceTime(500))
			.subscribe(_ => {
				this.commissionApi.commissionStatus(this.detailState.getCommissionId()).subscribe(s => {
					this.detailState.commissionStatus$.next(s.status);
					this.toast.show('更新成功', {
						type: 'success',
						origin: {
							clientX: a.right,
							clientY: a.top,
						},
						// el,
						timeout: 1000,
					});
				});
			});
	}

	func(i: number): void {
		if (!((this.commissionStatus$.value === 6 || this.commissionStatus$.value === 4) && i === 1)) {
			switch (i) {
				case 0:
					this.addMoney();
					break;
				case 1:
					this.overtime();
					break;
				case 2:
					this.timeout();
					break;
				case 3:
					this.discontinue();
					break;
				case 4:
					this.paynote();
					break;
				case 5:
					this.chatwithcustomer();
					break;
			}
		}
	}

	selectFun(i: number): void {
		switch (i) {
			case 1:
				this.edit();
				break;
			case 2:
				this.closeCommission();
				break;
			case 3:
				this.startCommission();
				break;
			case 4:
				this.stopCommission();
				break;
			case 5:
				this.registration();
				break;
			case 6:
				this.canceRegistration();
				break;
		}
	}

	goback(): void {
		this.router.navigate(['/commission']);
	}
}
