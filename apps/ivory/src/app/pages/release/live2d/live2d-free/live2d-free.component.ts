import { map,tap,debounce } from 'rxjs/operators';
import { AfterViewInit,ElementRef,ViewChild,QueryList,ViewChildren,AfterViewChecked } from '@angular/core';
import { Component,OnInit,ChangeDetectorRef } from '@angular/core';
import { FormBuilder,Validators,FormControl } from '@angular/forms';
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
export class Live2dFreeComponent implements OnInit,AfterViewInit,AfterViewChecked {
	constructor(
		private fb: FormBuilder,
		private modal: ModalService,
		private route: ActivatedRoute,
		private api: ReleaseApiService,
		private cdr: ChangeDetectorRef
	) { }
	@ViewChild('submitButton')
	submitButton: ElementRef;
	@ViewChildren(Live2dUploadComponent)
	live2dUpload: QueryList<Live2dUploadComponent>;
	freeGoodsId: number = undefined;
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
		f: string[];
		fr: number;
		gl: any[];
	}>;

	editParam: Partial<{
		w: number;
		n: string;
		d: string;
		b: string;
		g: string;
		gd: string;
		t: string;
		gl: any[];
	}>;
	form = this.fb.group({
		n: ['',[emptyStringValidator(),Validators.required]],
		d: ['',[emptyStringValidator(),Validators.required]],
		b: ['',Validators.required],
		g: ['',Validators.required],
		a: [[]],
		fr: ['',Validators.required],
		c: ['',Validators.required],
		t: [[]],
		checked: [false,Validators.requiredTrue],
	});
	checkedForm = this.fb.group({
		enableFaceTrackerChecked: [false],
		enableSettingPanelChecked: [false],
		copyright: [[]],
		copychecked: [false],
	});
	freeModelFile = '';
	enableFaceTrackerChecked = false;
	enableSettingPanelChecked = false;
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

	selectTypeChange(type: 0 | 1) {
		if (type === 1) {
			this.form.addControl('fg',new FormControl('',Validators.required));
			this.form.addControl('fgn',new FormControl('',Validators.required));
		} else {
			this.form.removeControl('fg');
			this.form.removeControl('fgn');
		}
		this.cdr.markForCheck();
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
				this.api.getEditWork(Number(x.get('id'))).subscribe((r: Work) => {
					this.token = r.file;
					this.setMainForm(r);
					this.setModelChecked(r);
				});
			}
		});
	}

	private setMainForm(r: Work): void {
		this.freeModelFile = r.goodsList[0].file;
		this.freeGoodsId = r.goodsList[0].id;
		this.goodsId = r.id;
		this.form.patchValue(r.goodsList[0].fileType === 1 ? {
			n: r.name,
			d: r.description,
			b: { url: r.cover },
			t: r.tag,
			c: r.copyright,
			g: this.token,
			a: r.authority,
			fr: r.goodsList[0].fileType,
			fg: r.goodsList[0].file,
			fgn: r.goodsList[0].name,
		} : {
				n: r.name,
				d: r.description,
				b: { url: r.cover },
				t: r.tag,
				c: r.copyright,
				g: this.token,
				a: r.authority,
				fr: r.goodsList[0].fileType,
			});
		this.copyrightModel = r.authority;
		this.live2dUpload.first.loadFileFromOpal(r.file,r.fileData ? JSON.parse(r.fileData) : null);
		this.cdr.markForCheck();
	}

	private setModelChecked(r: Work): void {
		if (JSON.parse(r.fileData)) {
			this.checkedForm.patchValue({
				enableFaceTrackerChecked: JSON.parse(r.fileData).enableFaceTracker ? true : false,
				enableSettingPanelChecked: JSON.parse(r.fileData).enableSettingPanel ? true : false,
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
		this.api.updateWork({
			w: this.editParam.w,
			n: this.editParam.n,
			g: this.editParam.g,
			d: this.editParam.d,
			gd: this.editParam.gd,
			t: this.editParam.t,
			b: this.editParam.b,
			gl: this.editParam.gl,
		}).subscribe({
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
		this.api.publishWork({
			n: this.param.n,
			d: this.param.d,
			a: this.param.a,
			b: this.param.b,
			g: this.param.g,
			t: this.param.t,
			c: this.param.c,
			cs: this.param.cs,
			f: this.param.f,
			gl: [{
				n: this.param.gl[0].n,
				s: this.param.gl[0].s,
				p: this.param.gl[0].p,
				f: this.param.gl[0].f,
			}],
		}).subscribe({
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
				map((value) => {
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
							fr: value.fr,
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
							w: this.goodsId,
							n: value.n,
							d: value.d,
							a: value.a,
							b: value.b,
							g: value.g,
							gd: value.gd,
							t: value.t.toString(),
							gl: this.freeModal,
						};
					}
				})
			)
			.subscribe((x) => {
				this.isEdit ? this.editParam = x : this.param = x;
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
				});
		}
	}

	private setFreeGoodList(): void {
		if (this.form.value.fr === 1) {
			if (this.isEdit) {
				this.freeModal = [
					{
						i: this.freeGoodsId,
						n: this.form.value.fgn,
						f: this.form.value.fg,
					},
				];

			} else if (!this.isEdit) {
				this.freeModal = [
					{
						n: this.form.value.fgn,
						s: -1,
						p: 0,
						f: this.form.value.fg,
					},
				];
			}
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

	ngAfterViewChecked(): void {
		if (this.live2dUpload.length > 1) {
			if (this.live2dUpload.last.live2dLoadStatus$.getValue() === 0 && this.freeModelFile) {
				this.live2dUpload.last.loadFileFromOpal(this.freeModelFile,null);
				this.freeModelFile = '';
			}
		}
	}
}
