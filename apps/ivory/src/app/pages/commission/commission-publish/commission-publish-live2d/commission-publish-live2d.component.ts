import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEmptyInputValue, live2dPriceValidator, ModalService, validator, ZoomService } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { fromEvent } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import { IllustZoomModalComponent } from '../../../work/illust-zoom-modal/illust-zoom-modal.component';
import { CommissionApiService } from './../../service/commission-api.service';

@Component({
	templateUrl: './commission-publish-live2d.component.html',
	styleUrls: ['./commission-publish-live2d.component.less'],
})
export class CommissionPublishLive2dComponent implements OnInit, AfterViewInit {
	constructor(
		private formBuild: FormBuilder,
		private api: CommissionApiService,
		private modal: ModalService,
		private route: ActivatedRoute,
		private router: Router,
		private zoom: ZoomService
	) {}

	activeList = [false, true, true, true];
	navActiveList = [false, false, false, false];
	uploadFile: Partial<File | FileList> = { name: '' };
	publishButtonHidden = true;
	isNext = false;
	mpValue = null;
	isEdit = false;
	spValue = null;
	previewImgsUrl = [];
	previewFileUrl = [];
	basicInfoFormVerify = false;
	detailInfoFormVerify = false;
	@ViewChild('minPrice')
	minPrice: ElementRef<HTMLInputElement>;
	@ViewChild('maxPrice')
	maxPrice: ElementRef<HTMLInputElement>;
	isScrict = true;
	param: Partial<{
		c: number;
		n: string;
		s: number;
		sd: string;
		d: number;
		sp: number;
		mp: number;
		det: string;
		en: number;
		an: number;
		spi: number;
		spii: number;
		f: number;
		ft: Array<string>;
	}> = {};

	get CurrentActive(): number {
		return this.activeList.findIndex(x => x === false);
	}

	basicInfoForm = this.formBuild.group({
		n: ['', [Validators.required, this.empty()]],
		s: [-1, Validators.min(0)],
		sd: ['', this.require()],
		d: [null, [this.needTimeValidator(), Validators.max(999)]],
		sp: [null, [live2dPriceValidator(), Validators.min(10), this.endWidthZero(), this.min()]],
		mp: [null, [live2dPriceValidator(), this.max(), Validators.max(99990), this.endWidthZero()]],
	});

	detailInfoForm = this.formBuild.group({
		det: ['', Validators.required],
		en: [0, [Validators.max(99), this.enAndAnTimeValidator()]],
		an: [0, [Validators.max(99), this.enAndAnTimeValidator()]],
		spi: [-1, [Validators.min(0)]],
		spii: [-1, [Validators.min(0)]],
		f: [[]],
		ft: [[]],
	});

	statementForm = this.formBuild.group({
		x: [false, [Validators.requiredTrue]],
	});

	endWidthZero(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			if (control.value == null) {
				return null;
			}
			const flag = control.value.toString().endsWith('0');
			if (flag) {
				return null;
			}
			return { endWidthZero: true };
		};
	}

	require(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			if (this.isScrict) {
				return null;
			} else {
				const regex = new RegExp(/(\s+)(\S*)(\s*)/g);
				if (regex.test(control.value)) {
					return { empty: true };
				}

				return isEmptyInputValue(control.value) ? { required: true } : null;
			}
		};
	}

	enAndAnTimeValidator(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			// control.value为null时，controler.value为0
			if (control.value == null) {
				return { nullEnAndAn: 'error' };
			} else if (control.value < 0) {
				return { negativeEnAndAn: 'error' };
			} else if (control.value % 1 !== 0) {
				return { floatEnAndAn: 'error' };
			} else {
				return null;
			}
		};
	}

	empty(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			const regex = new RegExp(/(\s+)(\S*)(\s*)/g);
			if (regex.test(control.value)) {
				return { empty: true };
			}
			return null;
		};
	}

	min(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			if (this.mpValue == null) {
				return null;
			}
			if (control.value >= this.mpValue) {
				return { moreThan: 'more than the mpValue ' };
			}
			return null;
		};
	}

	max(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			if (this.spValue == null) {
				return null;
			}
			if (control.value <= this.spValue) {
				return { lessThan: 'less than the spValue ' };
			}
			return null;
		};
	}

	needTimeValidator(): ValidatorFn {
		return (control: AbstractControl): { [key: string]: any } | null => {
			// control.value为null时，controler.value为0
			if (control.value == null) {
				return { nullTime: 'error' };
			} else if (control.value < 0) {
				return { negativeTime: 'error' };
			} else if (control.value % 1 !== 0) {
				return { floatTime: 'error' };
			} else {
				return null;
			}
		};
	}

	/**
	 *
	 * @param url fileUrl
	 * @description download the file
	 */
	downloadFile(url: string): void {
		window.open(url);
	}

	private setButtonState(currentIndex: number): void {
		if (currentIndex == 0) {
			this.isNext = this.basicInfoFormVerify;
		} else if (currentIndex == 1) {
			this.isNext = this.detailInfoFormVerify;
		}
	}

	changeForm(event: Event): void {
		// check the form when change the form in every time
		let currentIndex = this.activeList.findIndex(x => x === false);
		currentIndex = this.setPage(event, currentIndex);
		this.setNav(currentIndex);
	}

	/**
	 * @description change the nav
	 */
	private setNav(currentIndex: number): void {
		this.navActiveList.fill(true, 0, currentIndex);
		this.navActiveList.fill(false, currentIndex);
	}

	// change the page
	private setPage(event: Event, currentIndex: number): number {
		const flag = Number((event.target as HTMLElement).getAttribute('data-flag'));

		if (flag === 1) {
			if (currentIndex >= 1) {
				this.activeList = this.activeList.map(_x => true);
				this.activeList.splice(--currentIndex, 1, false);
			} else {
				if (this.isEdit) {
					this.router.navigateByUrl(`/commission/detail?id=${this.param.c}`);
				} else if (!this.isEdit) {
					this.router.navigateByUrl('/commission/publish');
				}
			}
		} else if (flag === 2) {
			this.checkForm(currentIndex);
			if (!this.isNext) {
				return currentIndex;
			}
			if (currentIndex < this.activeList.length - 1) {
				this.activeList = this.activeList.map(_x => true);
				this.activeList.splice(++currentIndex, 1, false);
			}
		} else if (flag === 3) {
			this.checkForm(currentIndex);
			if (!this.isNext) {
				return currentIndex;
			}
			if (this.isEdit) {
				this.sureEdit();
			} else {
				this.pubslish();
			}
		}

		return currentIndex;
	}

	private sureEdit(): void {
		this.api
			.update(
				this.param.c,
				Number(this.param.s),
				this.param.sd,
				this.param.d,
				this.param.sp,
				this.param.mp,
				this.param.det,
				0,
				0,
				this.param.f,
				this.param.ft
			)
			.subscribe({
				next: _x => {
					this.modal
						.open(PopTips, ['编辑成功', 0, 1])
						.afterClosed()
						.subscribe(_i => {
							this.router.navigate(['/commission/detail'], {
								queryParams: {
									id: this.param.c,
								},
							});
						});
				},
				error: _x => {
					this.modal.open(PopTips, ['编辑失败']);
				},
				complete: () => {
					// this.modal.open(PopTips, ['编辑成功', 0, 1]);
				},
			});
	}

	/**
	 * @description publish the work
	 */
	private pubslish(): void {
		this.api
			.publishLive2D(
				this.param.n,
				Number(this.param.s),
				this.param.sd,
				this.param.d,
				this.param.sp,
				this.param.mp,
				this.param.det,
				this.param.en,
				this.param.an,
				this.param.spi,
				this.param.spii,
				this.param.f,
				this.param.ft
			)
			.subscribe({
				next: (x: { id: number }) => {
					this.modal
						.open(PopTips, ['发布成功', 0, 1])
						.afterClosed()
						.subscribe(_i => {
							this.router.navigate(['/commission/detail'], {
								queryParams: {
									id: x.id,
								},
							});
						});
				},
				error: _x => {
					this.modal.open(PopTips, ['发布失败']);
				},
				complete: () => {
					// this.modal.open(PopTips, ['发布成功', 0, 1]);
				},
			});
	}

	getEditWorkData(): void {
		this.param.c = this.route.snapshot.queryParams.cid;
		if (!this.param.c) {
			return;
		}
		this.isEdit = true;
		this.api.detail(this.param.c).subscribe({
			next: x => {
				this.basicInfoForm.patchValue({
					n: x.commission.name,
					s: x.commission.secrecy,
					sd: x.commission.secrecyDescription,
					mp: x.commission.maxPrice,
					sp: x.commission.minPrice,
					d: x.commission.day,
				});

				this.detailInfoForm.patchValue({
					spi: x.property.project || -1,
					det: x.commission.detail,
					en: x.commission.expressionCount,
					an: x.commission.actionCount,
					spii: x.property.split || 1,
					f: x.commission.file
						? [
								{
									url: x.commission.file,
									name: x.commission.fileName,
								},
						  ]
						: [],
					ft:
						x.commission.fileImages.length == 0
							? []
							: x.commission.fileImages.map(_ => {
									return {
										url: _,
									};
							  }),
				});
			},
			error: x => {
				console.log(x);
			},
		});
	}

	/**
	 *
	 * @param currentIndex current page's index
	 * @description check the form
	 */
	checkForm(currentIndex: number = 0): void {
		if (currentIndex === 0) {
			validator(this.basicInfoForm, this.basicInfoForm.controls);
		} else if (currentIndex === 1) {
			validator(this.detailInfoForm, this.detailInfoForm.controls);
		} else if (currentIndex === 3) {
			validator(this.statementForm, this.statementForm.controls);
		} else {
			this.isNext = true;
		}
	}

	checkPrice(index: number): void {
		if (index == 0) {
			validator(this.basicInfoForm, {
				sp: this.basicInfoForm.controls['sp'],
			});
		} else if (index == 1) {
			validator(this.basicInfoForm, {
				mp: this.basicInfoForm.controls['mp'],
			});
		}
	}

	upload(e: Partial<File | FileList>): void {
		this.uploadFile = e;
	}

	ngOnInit(): void {
		this.subscribeForm();
		this.getEditWorkData();
		// check the form in this time
		const currentIndex = this.activeList.findIndex(x => x === false);
		this.checkForm(currentIndex);
	}

	ngAfterViewInit(): void {
		this.bind();
	}

	private bind(): void {
		fromEvent(this.minPrice.nativeElement, 'input')
			.pipe(debounceTime(1000))
			.subscribe(_x => {
				this.checkPrice(1);
			});

		fromEvent(this.maxPrice.nativeElement, 'input')
			.pipe(debounceTime(1000))
			.subscribe(_x => {
				this.checkPrice(0);
			});
	}

	/**
	 * @description merge the form to change the param
	 */
	private subscribeForm(): void {
		this.basicInfoForm.valueChanges
			.pipe(
				tap(x => {
					this.mpValue = x.mp;
					this.spValue = x.sp;
					if (x.s == 1) {
						this.isScrict = false;
					} else {
						this.isScrict = true;
					}
				}),
				map(_ => {
					const result = {};
					result['n'] = _.n;
					result['s'] = _.s;
					result['sd'] = _.sd;
					result['d'] = _.d;
					result['sp'] = _.sp / 10;
					result['mp'] = _.mp / 10;
					return result;
				})
			)
			.subscribe(x => {
				console.log(1);
				this.param = { ...this.param, ...x };
			});

		this.detailInfoForm.valueChanges
			.pipe(
				tap(_ => {
					this.previewImgsUrl = _.ft ? _.ft?.map(x => x.url) : [];
					this.previewFileUrl = _.f
						? _.f.map(x => {
								return { url: x.url, name: x.name };
						  })
						: [];
				}),
				map(_ => {
					const result = {};
					result['det'] = _.det;
					result['en'] = _.en;
					result['an'] = _.an;
					result['spi'] = _.spi;
					result['f'] = _.f.length != 0 ? _.f.map(x => x.token || x.url)[0] : '';
					result['ft'] = _.ft ? _.ft?.map(x => x.remote_token || x.url) : [];
					result['spii'] = _.spii;
					return result;
				})
			)
			.subscribe(x => {
				this.param = { ...this.param, ...x };
				console.log(this.param);
			});

		this.statementForm.statusChanges.subscribe(x => {
			if (x === 'INVALID') {
				this.isNext = false;
			} else if (x === 'VALID') {
				this.isNext = true;
			}
		});

		this.basicInfoForm.statusChanges.subscribe(x => {
			if (x === 'INVALID') {
				this.basicInfoFormVerify = false;
			} else if (x === 'VALID') {
				this.basicInfoFormVerify = true;
			}
			this.isNext = this.basicInfoFormVerify;
		});

		this.detailInfoForm.statusChanges.subscribe(x => {
			if (x === 'INVALID') {
				this.detailInfoFormVerify = false;
			} else if (x === 'VALID') {
				this.detailInfoFormVerify = true;
			}
			this.isNext = this.detailInfoFormVerify;
		});
	}

	showDetail(data: string): void {
		this.zoom.open(IllustZoomModalComponent, {
			assets: [data],
			index: 0,
		});
	}
}
