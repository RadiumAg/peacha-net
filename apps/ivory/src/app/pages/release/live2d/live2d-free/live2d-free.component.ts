import { map,tap,debounce } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { AfterViewInit,ElementRef,ViewChild } from '@angular/core';
import { Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder,Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Live2dUploadComponent } from '../../components/live2d-upload/live2d-upload.component';
import { SuccessTips } from '../../components/success-tips/success-tips';
import { BehaviorSubject,fromEvent,interval } from 'rxjs';
import { ReleaseApiService } from '../../release-api.service';
import { emptyStringValidator,ModalService,validator,Work } from '@peacha-core';
import { Live2dTransformData } from '@peacha-studio-core';
import { PopTips } from '@peacha-core/components';


@Component({
	selector: 'ivo-live2d-free',
	templateUrl: './live2d-free.component.html',
	styleUrls: ['./live2d-free.component.less'],
})
export class Live2dFreeComponent implements OnInit,AfterViewInit {
	constructor(
		private fb: FormBuilder,
		private modal: ModalService,
		private route: ActivatedRoute,
		private api: ReleaseApiService,
		private cdr: ChangeDetectorRef
	) { }

	@ViewChild('submitButton')
	submitButton: ElementRef;

	@ViewChild(Live2dUploadComponent)
	live2dUpload: Live2dUploadComponent;
	param: {
		n: string;
		d: string;
		a: number;
		b: string;
		g: string;
		gd: string;
		t: string;
		c: number;
		cs: number;
		ss: number;
		f: [];
		fr: number;
		gl: [];
	};
	form = this.fb.group({
		n: ['',[emptyStringValidator(),Validators.required]],
		d: ['',[emptyStringValidator(),Validators.required]],
		b: ['',Validators.required],
		g: ['',Validators.required],
		a: [[]],
		c: ['',Validators.required],
		t: [[]],
		checked: [false,Validators.requiredTrue],
	});
	checkedForm = this.fb.group({
		enableFaceTrackerChecked: [false],
		enableSettingPanelChecked: [false],
		freeModelDownLoadChecked: [false],
		copyright: [[]],
		copychecked: [false],
	});
	aCheckedOne = false;
	aCheckedTwo = false;
	aCheckedThree = false;
	aCheckedFour = false;
	enableFaceTrackerChecked = false;
	enableSettingPanelChecked = false;
	freeModelDownLoadChecked = false;
	modelCheckedSet = false;
	transformData: Live2dTransformData;
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
	freeModal = [];
	isEdit = false;
	stateMentStrategy = {
		['fllow']: () => {
			this.stateMentStates = this.stateMentStates.map(_x => true);
			this.resetAChecked();
		},
		['orgin']: () => {
			this.stateMentStates = this.stateMentStates.map(_x => false);
		},
	};

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

	private getEditWorkData(): void {
		this.route.paramMap.subscribe(x => {
			if (x.get('id')) {
				this.isEdit = true;
				this.api.get_edit_work(Number(x.get('id'))).subscribe((r: Work) => {
					this.token = r.file;
					this.setMainForm(r);
					this.setModelChecked(r);
				});
			}
		});
	}

	private setMainForm(r: Work): void {
		this.form.patchValue({
			n: r.name,
			d: r.description,
			b: { url: r.cover },
			t: r.tag,
			c: r.copyright,
			g: this.token,
			a: r.authority,
		});
		this.copyrightModel = r.authority;
		this.live2dUpload.loadFileFromOpal(r.file,r.file_data ? JSON.parse(r.file_data) : null);
	}

	private setModelChecked(r: Work): void {
		if (JSON.parse(r.file_data)) {
			this.checkedForm.patchValue({
				enableFaceTrackerChecked: JSON.parse(r.file_data).enableFaceTracker ? true : false,
				enableSettingPanelChecked: JSON.parse(r.file_data).enableSettingPanel ? true : false,
				freeModelDownLoadChecked: r.goodsList.length && r.goodsList[0].sell_state > 0 ? true : false,
			});
		}
	}

	private getCopyRight(): void {
		this.api.copyright(0).subscribe((x: { list: { name: string; id: number }[] }) => {
			this.copyrightCheckes$.next(x.list);
			this.setInitstateMentStates();
		});
	}

	private sure_edit(): void {
		const params = {
			w: this.route.snapshot.params.id,
			d: this.param.d,
			i: [],
			t: this.param.t,
			b: this.param.b,
			n: this.param.n,
			g: this.param.g,
			gl: this.freeModal,
			gd: this.param.gd,
			fr: this.param.fr,
			dg: [],
		};
		this.api.update_work(params).subscribe({
			next: () => {
				this.modal.open(SuccessTips,{
					redirectUrl: 'user',
					tip: '已成功提交审核，请等待后台人员审核!',
				});
			},
			error: (x: { descrption: string }) => {
				if (x.descrption) {
					this.modal.open(PopTips,[x.descrption]);
				} else {
					this.modal.open(PopTips,['系统繁忙']);
				}
			},
		});
	}

	private public_work(): void {
		this.api.publish_work(this.param).subscribe({
			next: _x => {
				this.modal.open(SuccessTips,{
					redirectUrl: '/member/manager/live2D/auditing',
					tip: '已成功提交审核，请等待后台人员审核！',
				});
			},
			error: (x: { descrption: string }) => {
				if (x.descrption) {
					this.modal.open(PopTips,[x.descrption,false,0]);
				} else {
					this.modal.open(PopTips,['系统繁忙',false,0]);
				}
			},
		});
	}

	changeCopyrightState($event: number): void {
		if (!this.isEdit) {
			switch ($event) {
				case 0:
					this.stateMentStrategy.orgin();
					break;

				case 1:
					this.stateMentStrategy.fllow();
					break;
			}
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

	onFreeModelDownloadChanged($event): void {
		if ($event) {
			this.isModalFreeDownloadTip();
		}
	}

	openPDF(url: string): void {
		window.open(url);
	}

	submit(): void {
		validator(this.form,this.form.controls);
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
				tap(_value => {
					this.setModalCheckedDisabled();
					this.setFreeGoodList();
				}),
				map((value: any) => {
					if (!this.isEdit) {
						value.gd = JSON.stringify({
							transformData: { ...this.transformData },
							enableFaceTracker: this.modalSetting.enableFaceTracker,
							enableSettingPanel: this.modalSetting.enableSettingPanel,
						});
						value.b = value.b.token || '';
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
							fr: this.checkedForm.value.freeModelDownLoadChecked ? 1 : 0,
							ss: 0,
							gl: this.freeModal,
						};
					} else {
						value.b = value.b.token || value.b.url;
						value.gd = JSON.stringify({
							transformData: { ...this.transformData },
							enableFaceTracker: this.modalSetting.enableFaceTracker,
							enableSettingPanel: this.modalSetting.enableSettingPanel,
						});
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
							ss: 0,
							fr: this.checkedForm.value.freeModelDownLoadChecked ? 1 : 0,
							gl: this.freeModal,
						};
					}
				})
			)
			.subscribe((x: any) => {
				this.param = x;
			});
	}

	private setModalCheckedDisabled(): void {
		console.log(this.form.value.g);
		if (this.form.value.g) {
			this.modelCheckedSet = false;
		} else {
			this.modelCheckedSet = true;
			this.checkedForm.patchValue({
				enableFaceTrackerChecked: false,
				enableSettingPanelChecked: false,
				freeModelDownLoadChecked: false,
			});
		}
	}

	isModalFreeDownloadTip(): void {
		if (this.checkedForm.value['freeModelDownLoadChecked']) {
			this.modal
				.open(PopTips,['是否确定免费提供该模型文件下载',true,2])
				.afterClosed()
				.subscribe(x => {
					if (!x) {
						this.checkedForm.patchValue({
							freeModelDownLoadChecked: false,
						});
					}
					// this.setFreeGoodList();
				});
		}
	}

	private setFreeGoodList(): void {
		if (this.checkedForm.value['freeModelDownLoadChecked']) {
			this.freeModal = [
				{
					n: '免费下载内容',
					s: -1,
					p: 0,
					f: [],
				},
			];
		} else {
			this.freeModal = [];
		}
	}

	private setInitstateMentStates(): void {
		this.copyrightCheckes$.subscribe(x => {
			this.stateMentStates = x.map(_ => true);
		});
	}

	ngOnInit(): void {
		this.getCopyRight();
		this.subscribeForm();
		this.getEditWorkData();
		this.setModalCheckedDisabled();
	}

	ngAfterViewInit(): void {
		fromEvent(this.submitButton.nativeElement,'click')
			.pipe(debounce(() => interval(500)))
			.subscribe(() => {
				this.submit();
			});
	}
}
