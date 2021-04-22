import { map, tap, debounce } from 'rxjs/operators';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Live2dUploadComponent } from '../../components/live2d-upload/live2d-upload.component';
import { SuccessTips } from '../../components/success-tips/success-tips';
import { BehaviorSubject, fromEvent, interval } from 'rxjs';
import { ReleaseApiService } from '../../release-api.service';
import { ModalService, Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { emptyStringValidator, live2dPriceValidator, validator } from '@peacha-core';
import { Live2dTransformData } from '@peacha-studio-core';
import { EWorkAuditState } from '../../../member/manager/single-manager/single-manager.page';

@Component({
	selector: 'ivo-live2d-paid',
	templateUrl: './live2d-paid.component.html',
	styleUrls: ['./live2d-paid.component.less'],
})
export class Live2dPaidComponent implements OnInit, AfterViewInit {
	constructor(private fb: FormBuilder, private modal: ModalService, private route: ActivatedRoute, private api: ReleaseApiService) {}

	@ViewChild('submitButton')
	submitButton: ElementRef;
	@ViewChild(Live2dUploadComponent)
	live2dUpload: Live2dUploadComponent;
	@ViewChild('godds_live2d')
	goodsLivewdUpload: Live2dUploadComponent;
	Fixed = Number.prototype.toFixed;
	payGoodsId: number = undefined;
	goodsId: number = undefined;
	param: Partial<{
		n: string;
		d: string;
		a: number[];
		b: string;
		g: string;
		gd: string;
		t: string;
		c: number;
		cs: number;
		fr: number;
		f: string[];
		gl: any[];
	}> = {};

	editParam: Partial<{
		w: number;
		n: string;
		d: string;
		b: string;
		g: string;
		gd: string;
		t: string;
		gl: any[];
	}> = {};

	form = this.fb.group({
		n: ['', [Validators.required, emptyStringValidator()]],
		d: ['', [Validators.required, emptyStringValidator()]],
		b: ['', Validators.required],
		g: ['', Validators.required],
		a: [[]],
		c: [0],
		gn: ['', Validators.required],
		p: ['', live2dPriceValidator()],
		gl_token: ['', Validators.required],
		gl_s: ['', Validators.required],
		t: [[]],
		checked: [false, Validators.requiredTrue],
	});
	checkedForm = this.fb.group({
		enableFaceTrackerChecked: [false],
		enableSettingPanelChecked: [false],
		sSaleChecked: [false],
		dSaleChecked: [false],
		copyright: [[]],
		copychecked: [false],
	});
	saleDisabled = false;
	aCheckedOne = false;
	aCheckedTwo = false;
	aCheckedThree = false;
	aCheckedFour = false;
	enableFaceTrackerChecked = false;
	enableSettingPanelChecked = false;
	pInputDisabled = '';
	modelCheckedSet = false;
	transformData: Live2dTransformData;
	maxPrice = 99999;
	token: string;
	copyrightCheckes$ = new BehaviorSubject<{ id: number; name: string }[]>([]);
	copyrightModel = [];
	stateMentStates: boolean[];
	private modalSetting: {
		transformData: any;
		enableFaceTracker: boolean;
		enableSettingPanel: boolean;
	} = {
		transformData: {},
		enableFaceTracker: false,
		enableSettingPanel: false,
	};
	isEdit = false;
	stateMentStrategy = {
		['fllow']: () => {
			this.stateMentStates = this.stateMentStates.map(x => true);
			this.resetAChecked();
		},
		['orgin']: () => {
			this.stateMentStates = this.stateMentStates.map(x => false);
		},
		['not_checked']: () => {
			this.stateMentStates = this.stateMentStates.map(x => true);
		},
	};
	call = (x: Function, y: any, ...args) => x.call(y, args);
	setSaleDisabledState(): void {
		if (this.form.value.gl_token) {
			this.saleDisabled = false;
			this.pInputDisabled = '';
		} else {
			this.saleDisabled = true;
			this.pInputDisabled = 'disabled';
			this.checkedForm.patchValue({
				sSaleChecked: false,
				dSaleChecked: false,
			});
		}

		// 商品出售方式不可修改
		// 2020/11/4
		// by kinori
		if (this.isEdit) {
			this.saleDisabled = true;
		}
	}

	priceValidate(e: Event) {
		const price = e.target as HTMLInputElement;
		price.value.length > 5
			? (price.value = price.value.slice(0, price.value.length - 1))
			: price.value.includes('.')
			? (price.value = price.value.slice(0, price.value.lastIndexOf('.')))
			: '';
	}

	onTransformDataUpdate(data: Live2dTransformData): void {
		this.transformData = data;
		this.form.patchValue({
			gd: JSON.stringify({
				transformData: { ...this.transformData },
				enableFaceTracker: this.modalSetting.enableFaceTracker,
				enableSettingPanel: this.modalSetting.enableSettingPanel,
			}),
		});
	}

	private resetAChecked(): void {
		this.checkedForm.patchValue({
			copychecked: false,
		});
	}

	/**
	 * @description 验证
	 */
	private validator(): boolean {
		let flag = true;

		if (!this.form.valid) {
			flag = false;
		}
		return flag;
	}

	changeCopyright($event: string[]): void {
		this.form.patchValue({
			a: $event,
		});
	}

	private getEditWorkDataHandler = (r: Work) => {
		this.setMainForm(r);
		this.setModelChecked(r);
		this.goodsLivewdUpload.loadFileFromOpal(r.goodsList[0].file, null);
	};

	private getEditWorkData(): void {
		this.route.paramMap.subscribe(x => {
			if (x.get('id')) {
				this.isEdit = true;
				this.editParam.w = parseInt(x.get('id'), 10);
				if (+this.route.snapshot.queryParams.c === EWorkAuditState.success) {
					this.api.getWork(parseInt(x.get('id'), 10)).subscribe(this.getEditWorkDataHandler);
				} else if (+this.route.snapshot.queryParams.c === EWorkAuditState.fail) {
					this.api.getEditWork(parseInt(x.get('id'), 10)).subscribe(this.getEditWorkDataHandler);
				}
			}
		});
	}

	private setModelChecked(r: Work): void {
		if (JSON.parse(r.fileData)) {
			const fileData = JSON.parse(r.fileData);
			this.checkedForm.patchValue({
				enableFaceTrackerChecked: fileData.enableFaceTracker || false,
				enableSettingPanelChecked: fileData.enableSettingPanel || false,
			});
			this.modalSet([fileData.enableFaceTracker ? '0' : '', fileData.enableSettingPanel ? '1' : '']);
		}
	}

	private setMainForm(r: Work): void {
		this.token = r.file;
		this.payGoodsId = r.goodsList[0].id;
		this.goodsId = r.id;
		this.form.patchValue({
			n: r.name,
			d: r.description,
			b: { url: r.cover },
			t: r.tag.map(x => (typeof x === 'string' ? x : x.name)),
			c: r.copyright,
			g: this.token,
			a: r.authority,
			p: r.goodsList[0].price,
			s: r.goodsList[0].maxStock,
			gl_token: r.goodsList[0].file,
			gl_s: r.goodsList[0].maxStock,
			gn: r.goodsList[0].name,
		});
		this.copyrightModel = r.authority;
		this.live2dUpload.loadFileFromOpal(r.file, r.fileData ? JSON.parse(r.fileData) : null);
	}

	private getCopyRight(): void {
		this.api.copyright(0).subscribe((x: { list: { name: string; id: number }[] }) => {
			this.copyrightCheckes$.next(x.list);
			this.setInitstateMentStates();
		});
	}

	private sure_edit(): void {
		this.api
			.updateWork({
				w: this.editParam.w,
				n: this.editParam.n,
				g: this.editParam.g,
				d: this.editParam.d,
				gd: this.editParam.gd,
				t: this.editParam.t,
				b: this.editParam.b,
				gl: this.editParam.gl,
			})
			.subscribe({
				next: () => {
					this.modal.open(SuccessTips, {
						redirectUrl: 'user',
						tip: '已成功提交审核，请等待后台人员审核!',
					});
				},
				error: (x: { descrption: string }) => {
					if (x.descrption) {
						this.modal.open(PopTips, [x.descrption]);
					} else {
						this.modal.open(PopTips, ['系统繁忙']);
					}
				},
			});
	}

	private public_work(): void {
		this.api
			.publishWork({
				n: this.param.n,
				d: this.param.d,
				a: this.param.a,
				b: this.param.b,
				g: this.param.g,
				t: this.param.t,
				c: this.param.c,
				cs: this.param.cs,
				f: this.param.f,
				gd: this.param.gd,
				gl: [
					{
						n: this.param.gl[0].n,
						s: this.param.gl[0].s,
						p: this.param.gl[0].p,
						f: this.param.gl[0].f,
					},
				],
			})
			.subscribe({
				next: () => {
					this.modal.open(SuccessTips, {
						redirectUrl: '/member/manager/live2D/auditing',
						tip: '已成功提交审核，请等待后台人员审核！',
					});
				},
				error: (x: { descrption: string }) => {
					if (x.descrption) {
						this.modal.open(PopTips, [x.descrption, false, 0]);
					} else {
						this.modal.open(PopTips, ['系统繁忙', false, 0]);
					}
				},
			});
	}

	changeCopyrightState(): void {
		if (!this.isEdit) {
			this.stateMentStrategy.orgin();
		}
	}

	modalSet($event: string[]): void {
		this.modalSetting.enableFaceTracker = false;
		this.modalSetting.enableSettingPanel = false;
		$event.forEach(x => {
			switch (x) {
				case '0':
					this.modalSetting.enableFaceTracker = true;
					break;
				case '1':
					this.modalSetting.enableSettingPanel = true;
					break;
			}
		});

		const new_gd = {
			...this.form.value.gd,
			enableFaceTracker: this.modalSetting.enableFaceTracker,
			enableSettingPanel: this.modalSetting.enableSettingPanel,
		};

		this.form.patchValue({ gd: new_gd });
	}

	openPDF(url: string): void {
		window.open(url);
	}

	submit(): void {
		validator(this.form, this.form.controls);
		if (!this.validator()) {
			return;
		}
		if (this.isEdit) {
			this.sure_edit();
		} else {
			this.public_work();
		}
	}

	private subscribeForm(): void {
		this.form.valueChanges
			.pipe(
				tap(() => {
					this.setModalCheckedDisabled();
					this.setSaleDisabledState();
				}),
				map(value => {
					if (!this.isEdit) {
						value.gd = JSON.stringify({
							transformData: { ...this.transformData },
							enableFaceTracker: this.modalSetting.enableFaceTracker,
							enableSettingPanel: this.modalSetting.enableSettingPanel,
						});
						value.b = value.b.token || '';
						if (value.gl_token) {
							value.gl = [
								{
									n: value.gn,
									f: value.gl_token,
									s: value.gl_s,
									p: value.p,
								},
							];
						}
						return {
							n: value.n,
							d: value.d,
							a: value.a,
							b: value.b,
							g: value.g,
							gd: value.gd,
							t: value.t.toString(),
							f: [],
							c: value.c,
							cs: 0,
							fr: 0,
							gl: value.gl,
						};
					} else if (this.isEdit) {
						value.b = value.b.token || value.b.url;
						value.gd = JSON.stringify({
							transformData: { ...this.transformData },
							enableFaceTracker: this.modalSetting.enableFaceTracker,
							enableSettingPanel: this.modalSetting.enableSettingPanel,
						});
						value.gl = [
							{
								n: value.gn,
								f: value.gl_token,
								i: this.payGoodsId,
							},
						];
						return {
							w: this.goodsId,
							n: value.n,
							d: value.d,
							a: value.a,
							b: value.b,
							g: value.g,
							gd: value.gd,
							t: value.t.toString(),
							gl: value.gl,
						};
					}
				})
			)
			.subscribe(x => {
				this.isEdit ? (this.editParam = x) : (this.param = x);
			});
	}

	private setModalCheckedDisabled(): void {
		if (this.form.value.g) {
			this.modelCheckedSet = false;
		} else {
			this.modelCheckedSet = true;
			this.checkedForm.patchValue({
				enableFaceTrackerChecked: false,
				enableSettingPanelChecked: false,
			});
		}
	}

	private setInitstateMentStates(): void {
		this.copyrightCheckes$.subscribe(x => {
			this.stateMentStates = x.map(_ => true);
		});
	}

	private setChecked(): void {
		this.setModalCheckedDisabled();
		this.setSaleDisabledState();
	}

	ngOnInit(): void {
		this.getCopyRight();
		this.subscribeForm();
		this.getEditWorkData();
		this.setChecked();
		this.initForm();
	}

	private initForm() {
		if (this.isEdit) {
			const oldPrice = this.form.getRawValue().p;
			this.form.removeControl('p');
			this.form.addControl('p', new FormControl({ value: oldPrice, disabled: true }, { validators: live2dPriceValidator }));
		}
	}

	ngAfterViewInit(): void {
		fromEvent(this.submitButton.nativeElement, 'click')
			.pipe(debounce(() => interval(500)))
			.subscribe(() => {
				this.submit();
			});
	}
}
