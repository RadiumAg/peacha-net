import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, startWith, tap, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Select } from '@ngxs/store';
import { TradeApiService } from '../../pay/trade-api.service';
import { UserState, ModalService } from '@peacha-core';
import { PopTips, Steps } from '@peacha-core/components';


@Component({
	selector: 'ivo-wallet',
	templateUrl: './wallet.page.html',
	styleUrls: ['./wallet.page.less'],
})
export class WalletPage {
	@Select(UserState.identity_state)
	identity_state$: Observable<number>;

	a = new Date();
	date: FormControl = new FormControl(null);
	key: FormControl = new FormControl('');
	isHelpShow = false;

	update$ = new BehaviorSubject<number>(0);

	page$ = new BehaviorSubject<number>(0);


	dateMonth = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
	thisYear = new Date().getFullYear();
	thisMonth = new Date().getMonth() + 1;

	account$: Observable<{
		is_usable: boolean;
		balance: number;
		cashout: number;
	}> = combineLatest([this.update$]).pipe(
		switchMap(_s => {
			return this.http.get<any>(`/trade/wallet/info`);
		})
	);

	wallet$ = combineLatest([this.route.queryParams, this.date.valueChanges.pipe(startWith(new Date())), this.update$]).pipe(
		switchMap(([r]) => {
			return this.tradeapi.queryWalletBill(r.m as Date, r.p ?? 1, r.s ?? 7).pipe(
				tap(_s => {
					this.page$.next(r.p ?? 1);
				})
			);
		})
	);
	constructor(
		private http: HttpClient,
		private route: ActivatedRoute,
		private router: Router,
		private modal: ModalService,
		private tradeapi: TradeApiService
	) { }
	@ViewChild(Steps) steps: Steps;

	toWithdraw() {
		this.identity_state$
			.pipe(
				take(1),
				tap(s => {
					if (s != 2) {
						this.modal.open(PopTips, ['提现需通过实名认证，请前往个人中心进行实名认证', false]);
					} else {
						this.router.navigate(['/wallet/withdraw']);
					}
				})
			)
			.subscribe();
	}

	refresh() {
		this.update$.next(1);
	}
	handleDatePanelChange(_mode: string): void {
		console.log(1);
		this.router.navigate([], {
			queryParams: {
				m: this.date.value,
			},
		});
	}


	// help() {
	//     this.isHelpShow = !this.isHelpShow;
	// }
	// jump(app: number, data: number) {
	//     switch (app) {
	//         case 0:
	//             this.router.navigate(['/setting/wallet/withdrawdetail'], {
	//                 queryParams: {
	//                     id: data,
	//                 },
	//             });
	//             break;
	//         case 1:
	//             this.router.navigate(['/setting/wallet/paydetail'], {
	//                 queryParams: {
	//                     id: data,
	//                 },
	//             });
	//             break;

	//         default:
	//             this.router.navigate(['/setting/wallet/orderdetail'], {
	//                 queryParams: {
	//                     o: data,
	//                 },
	//             });
	//     }
	// }

	page(data: number) {
		this.router.navigate([], {
			queryParams: {
				p: data,
			},
			queryParamsHandling: 'merge',
		});
		document.documentElement.scrollTop = 0;
	}

	keyword() {
		this.router.navigate([], {
			queryParams: {
				k: this.key.value,
				p: 1,
			},
			queryParamsHandling: 'merge',
		});
	}

	toOrderDetail(i: string, p: string, id: string) {
		if (i.includes('企划')) {
			this.http.get<{ commissionId: number }>(`/commission/order/commission?o=${id}`).subscribe(s => {
				window.open(location.origin + '/commission/detail/payment?id=' + s.commissionId);
			});
		} else {
			window.open(p);
		}
	}

}
