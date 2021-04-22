import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { debounce, map } from 'rxjs/operators';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, fromEvent, interval } from 'rxjs';
import { emptyStringValidator, ModalService, validator, Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { IPublishFileType, IUpdateWork, ReleaseApiService } from '../../release-api.service';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { IFileItem } from 'libs/peacha-core/src/lib/components/file-upload/file-upload.component';
import { EWorkAuditState } from '../../../member/manager/single-manager/single-manager.page';

@Component({
	selector: 'ivo-3dmodel',
	templateUrl: './3dModel-free.component.html',
	styleUrls: ['./3dModel-free.component.less'],
})
export class ThreeModelFreeComponent implements OnInit, AfterViewInit {
	constructor(
		public sanitizer: DomSanitizer,
		private fb: FormBuilder,
		private modal: ModalService,
		private route: ActivatedRoute,
		private api: ReleaseApiService,
		private cdr: ChangeDetectorRef
	) {}

	bvUrl: SafeResourceUrl;
	ESelectPreviewType: ('image' | 'bv')[] = [];
	@ViewChild('submitButton')
	submitButton: ElementRef;
	publishParam: {
		n: string;
		d: string;
		a: number[];
		b: string;
		t: string;
		c: number;
		cs: number;
		ss: number;
		f: [];
		bv: string;
		gl: IPublishFileType[];
	};

	editParam: {
		n: string;
		d: string;
		a: number;
		b: string;
		t: string;
		c: number;
		cs: number;
		ss: number;
		f: [];
		bv: string;
		gl: IUpdateWork[];
	};

	form = this.fb.group({
		f: [[]],
		n: ['', [Validators.required, emptyStringValidator()]],
		d: ['', [Validators.required, emptyStringValidator()]],
		t: [[]],
		b: ['', Validators.required],
		c: ['', Validators.required],
		bv: [''],
		a: [[]],
		checked: [false, Validators.requiredTrue],
		gl: this.fb.array([]),
	});

	checkedForm = this.fb.group({
		aCheckedOne: [false],
		aCheckedTwo: [false],
		copyright: [[]],
		copychecked: [false],
		selectPreViewImage: [false],
		selectPreViewTv: [false],
	});
	copyrightCheckes$ = new BehaviorSubject<{ id: number; name: string }[]>([]);
	stateMentStates = [];
	copyrightModel = [];
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

	get glArray() {
		return <FormArray>this.form.get('gl');
	}

	addGlItem(n?: string, f?: IFileItem, ft?: number) {
		const createGlGroup = this.fb.group({
			n: [n || '', Validators.required],
			f: [f || null, Validators.required],
			ft: [ft || 0, Validators.required],
		});
		Reflect.set(createGlGroup, 'symbol', Symbol());
		this.glArray.push(createGlGroup);
	}

	changeCopyright($event: number[]) {
		this.form.patchValue({
			a: $event,
		});
	}

	addGoodsList() {
		if (this.glArray.controls.length === 5) {
			return;
		}
		this.addGlItem();
	}

	setBvNumber(bvNumber: string) {
		if (bvNumber === '') {
			this.modal.open(PopTips, ['请输入bv号']);
			return;
		}
		this.bvUrl = this.getSafeUrl('//player.bilibili.com/player.html?bvid=' + bvNumber + '&page=1&high_quality=1');
		this.form.patchValue({ bv: bvNumber });
	}

	changeSelectPreviewType(event: ('image' | 'bv')[]) {
		this.ESelectPreviewType = [...event];
		this.form.get('bv') && this.form.get('bv').clearValidators();
		this.form.get('f') && this.form.get('f').clearValidators();
		if (event.includes('bv')) {
			this.form.get('bv') && this.form.get('bv').setValidators(Validators.required);
		} else {
			this.form.patchValue({ bv: '' });
		}
		if (event.includes('image')) {
			this.form.get('f') && this.form.get('f').setValidators(Validators.required);
		} else {
			this.form.patchValue({ f: [] });
		}
		this.cdr.markForCheck();
	}

	getSafeUrl(url: string) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}

	private resetAChecked() {
		this.checkedForm.patchValue({
			copychecked: false,
		});
	}

	private getEditWorkHandler = (r: Work) => {
		this.setPreviewType(r);
		this.copyrightModel = r.authority;
		r.goodsList.forEach(x => {
			this.addGlItem(x.name, { name: x.file.slice(-10), url: x.file }, x.fileType);
		});

		this.form.patchValue({
			n: r.name,
			d: r.description,
			b: { url: r.cover },
			bv: r.bvNumber,
			t: r.tag.map(x => (typeof x === 'string' ? x : x.name)),
			f: r.assets.map(_ => {
				return {
					url: _,
				};
			}),
			c: r.copyright,
		});
	};

	private getEditWork() {
		this.route.paramMap.subscribe(x => {
			if (x.get('id')) {
				this.isEdit = true;
				if (+this.route.snapshot.queryParams.c === EWorkAuditState.success) {
					this.api.getWork(parseInt(x.get('id'), 10)).subscribe(this.getEditWorkHandler);
				} else if (+this.route.snapshot.queryParams.c === EWorkAuditState.fail) {
					this.api.getEditWork(parseInt(x.get('id'), 10)).subscribe(this.getEditWorkHandler);
				}
				this.cdr.markForCheck();
			}
		});
	}

	private setPreviewType(r: Work) {
		if (r.assets.length > 0) {
			this.ESelectPreviewType.push('image');
			this.checkedForm.patchValue({
				selectPreViewImage: true,
			});
		}
		if (r.bvNumber) {
			this.ESelectPreviewType.push('bv');
			this.checkedForm.patchValue({
				selectPreViewTv: true,
			});
		}
	}

	private public_work() {
		this.api
			.publishWork({
				n: this.publishParam.n,
				d: this.publishParam.d,
				a: this.publishParam.a,
				b: this.publishParam.b,
				t: this.publishParam.t,
				c: this.publishParam.c,
				cs: 2,
				f: this.publishParam.f,
				gl: this.publishParam.gl,
				bv: this.publishParam.bv,
			})
			.subscribe({
				next: _x => {
					this.modal.open(SuccessTips, {
						redirectUrl: '/member/manager/3d/auditing',
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

	deleteGl(symbol: symbol) {
		console.log(this.glArray.controls.findIndex(_ => Reflect.get(_, 'symbol') === symbol));
		this.glArray.controls.splice(
			this.glArray.controls.findIndex(_ => Reflect.get(_, 'symbol') === symbol),
			1
		);
	}

	trackBy(index: number, model: { symbol: symbol }): symbol {
		return model.symbol;
	}

	changeCopyrightState($event: number) {
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

	submit() {
		if (!this.ESelectPreviewType.length) {
			this.modal.open(PopTips, ['请选择预览方式', '0']);
			return;
		}
		if (this.isEdit) {
		} else if (!this.isEdit) {
			if (!this.publishParam.gl) {
				this.modal.open(PopTips, ['请添加至少一个免费商品', '0']);
				return;
			}
		}
		validator(this.form, this.form.controls);
		this.glArray.controls.forEach(_ => {
			validator(_ as FormGroup, (_ as FormGroup).controls);
		});
		if (!this.form.valid) {
			return;
		}

		if (this.isEdit) {
			this.sure_edit();
		} else {
			this.public_work();
		}
	}

	private sure_edit() {
		this.api
			.updateWork({
				w: this.route.snapshot.params.id,
				bv: this.editParam.bv,
				d: this.editParam.d,
				i: this.editParam.f,
				t: this.editParam.t,
				b: this.editParam.b,
				n: this.editParam.n,
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
						this.modal.open(PopTips, [x.descrption, false, 0]);
					} else {
						this.modal.open(PopTips, ['系统繁忙', false, 0]);
					}
				},
			});
	}

	private subscribeForm() {
		this.form.valueChanges
			.pipe(
				map(value => {
					const gl = value.gl.length && value.gl.map(_ => ({ f: _.f?.token || _?.f?.url || '', n: _.n, ft: _.ft, p: 0, s: -1 }));
					value.b = value.b.token || value.b.url || '';
					value.f = value.f.map((s: { remote_token: string; url: string }) => s.remote_token || s.url);
					return {
						n: value.n,
						d: value.d,
						a: value.a,
						b: value.b,
						t: value.t.toString(),
						f: value.f,
						bv: value.bv,
						c: value.c,
						cs: 1,
						ss: 0,
						gl,
					};
				})
			)
			.subscribe(x => {
				this.isEdit ? (this.editParam = x) : (this.publishParam = x);
			});
	}

	private setInitstateMentStates() {
		this.copyrightCheckes$.subscribe(x => {
			this.stateMentStates = x.map(_ => true);
		});
	}

	private getCopyRight() {
		this.api.copyright(2).subscribe((x: { list: { name: string; id: number }[] }) => {
			this.copyrightCheckes$.next(x.list);
			this.setInitstateMentStates();
		});
	}

	ngOnInit() {
		this.getCopyRight();
		this.subscribeForm();
		this.getEditWork();
	}

	ngAfterViewInit() {
		fromEvent(this.submitButton.nativeElement, 'click')
			.pipe(debounce(() => interval(500)))
			.subscribe(() => {
				this.submit();
			});
	}
}
