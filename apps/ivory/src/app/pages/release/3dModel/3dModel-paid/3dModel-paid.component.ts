import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component,OnInit,ViewChild,ElementRef,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { debounce,map } from 'rxjs/operators';
import { FormArray,FormBuilder,FormGroup,Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject,fromEvent,interval } from 'rxjs';
import { emptyStringValidator,live2dPriceValidator,ModalService,validator,Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { IPublishFileType,IUpdateWork,ReleaseApiService } from '../../release-api.service';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { IFileItem } from 'libs/peacha-core/src/lib/components/file-upload/file-upload.component';
import { ConfirmComponent } from '../../components/confirm/confirm.component';
import { EStoke } from '../../common/EStoke';

@Component({
	selector: 'ivo-3dmodel',
	templateUrl: './3dModel-paid.component.html',
	styleUrls: ['./3dModel-paid.component.less'],
})
export class ThreeModelPaidComponent implements OnInit,AfterViewInit {
	constructor(
		public sanitizer: DomSanitizer,
		private fb: FormBuilder,
		private modal: ModalService,
		private route: ActivatedRoute,
		private api: ReleaseApiService,
		private cdr: ChangeDetectorRef) { }

	bvUrl: SafeResourceUrl;
	ESelectPreviewType: [('bv' | 'image')?,('bv' | 'image')?] = [];
	@ViewChild('submitButton')
	submitButton: ElementRef;
	firstGoodsSymbol: symbol;
	publishParam: {
		n: string;
		d: string;
		a: number[];
		b: string;
		t: string;
		c: number;
		cs: number;
		f: [];
		bv: string;
		gl: IPublishFileType[];
	};

	editParam: Partial<{
		w: number;
		n: string;
		d: string;
		b: string;
		t: string;
		c: number;
		f: [];
		bv: string;
		gl: (IUpdateWork & { p: number })[]
	}> = {};

	form = this.fb.group({
		f: [[]],
		n: ['',[Validators.required,emptyStringValidator()]],
		d: ['',[Validators.required,emptyStringValidator()]],
		t: [[]],
		b: ['',Validators.required],
		c: [0,Validators.required],
		bv: [''],
		a: [[]],
		checked: [false,Validators.requiredTrue],
		gl: this.fb.array([]),
	});

	checkedForm = this.fb.group({
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
	toFixed = Number.prototype.toFixed;
	call = (x: Function,y,...arg) => x.call(y,arg);
	get glArray() {
		return <FormArray>(this.form.get('gl'));
	}

	addGlItem(n?: string,f?: IFileItem,ft?: number,s?: number,p?: number,fr?: boolean,i?: number) {
		const createGlGroup = this.fb.group({
			n: [n || '',Validators.required],
			f: [f || null,Validators.required],
			ft: [ft || 0,Validators.min(1)],
			s: [{ value: s || EStoke.single,disabled: this.isEdit }],
			i: [i || -1],
			p: [p || '',live2dPriceValidator()],
			fr: [{ value: fr || false,disabled: this.isEdit }]
		});
		Reflect.set(createGlGroup,'symbol',Symbol());
		this.glArray.push(createGlGroup);
		this.setStokeToMultiple();
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
			this.modal.open(PopTips,['请输入bv号'])
			return;
		}
		this.bvUrl = this.getSafeUrl('//player.bilibili.com/player.html?bvid=' + bvNumber + '&page=1&high_quality=1');
		this.form.patchValue({ bv: bvNumber });
	}

	changeSelectPreviewType(event: [('image' | 'bv')?,('image' | 'bv')?]) {
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

	private getEditWork() {
		this.route.paramMap.subscribe(x => {
			if (x.get('id')) {
				this.isEdit = true;
				this.api.getEditWork(parseInt(x.get('id'),10)).subscribe((r: Work) => {
					this.setPreviewType(r);
					this.editParam.w = parseInt(x.get('id'),10);
					this.copyrightModel = r.authority;
					r.goodsList.forEach(x => {
						this.addGlItem(x.name,{ name: x.file.slice(-10),url: x.file },x.fileType,x.maxStock,x.price,x.price > 0 ? false : true,x.id);
					})
					this.form.patchValue({
						n: r.name,
						d: r.description,
						b: { url: r.cover },
						t: r.tag,
						bv: r.bvNumber,
						f: r.assets.map(_ => {
							return {
								url: _,
							};
						}),
						c: r.copyright,
					});
				});
				this.cdr.markForCheck();
			}
		});
	}

	private setPreviewType(r: Work) {
		if (r.assets.length > 0) {
			this.ESelectPreviewType.push('image');
			this.checkedForm.patchValue({
				selectPreViewImage: true
			});
		}
		if (r.bvNumber) {
			this.ESelectPreviewType.push('bv');
			this.checkedForm.patchValue({
				selectPreViewTv: true
			});
		}
	}

	private public_work() {
		this.api.publishWork({
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
		}).subscribe({
			next: _x => {
				this.modal.open(SuccessTips,{
					redirectUrl: '/member/manager/3d/auditing',
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

	deleteGl(symbol: symbol) {
		this.glArray.controls.splice(this.glArray.controls.findIndex(_ => Reflect.get(_,'symbol') === symbol),1);
		this.setStokeToMultiple();
	}

	private setStokeToMultiple() {
		if (this.glArray.length > 1) {
			const firstControl = this.glArray.controls.find(_ => Reflect.get(_,'symbol') === Reflect.get(this.glArray.controls[0],'symbol'));
			firstControl.patchValue({ s: EStoke.multiple });
		}
	}

	trackBy(index: number,model: { symbol: symbol }): symbol {
		return model.symbol;
	}

	submit() {
		if (!this.ESelectPreviewType.length) {
			this.modal.open(PopTips,['请选择预览方式','0']);
			return;
		}
		if (this.isEdit) { }
		else if (!this.isEdit) {
			if (!this.publishParam.gl) {
				this.modal.open(PopTips,['请添加至少一个商品','0']);
				return;
			}
		}
		validator(this.form,this.form.controls);
		this.glArray.controls.forEach(_ => { validator((_ as FormGroup),(_ as FormGroup).controls) });
		if (!this.form.valid) {
			return;
		}

		const isAllFree = this.isAllFree();
		if (isAllFree) {
			// eslint-disable-next-line no-sparse-arrays
			this.modal.open(ConfirmComponent,[`<section style='width:390px;font-size:16px;color:#333;'>
			您发布的作品中，未含有付费商品内容，因此作品将作为“免费分享”类型发布。<br/>若想添加付费商品内容，请点击“再次编辑“<section>`,'发布提示',,,'ivo-icon-piece'])
				.afterClosed().subscribe(x => {
					if (x) {
						if (this.isEdit) {
							this.sure_edit();
						} else {
							this.public_work();
						}
					}
				})
		} else {
			if (this.isEdit) {
				this.sure_edit();
			} else {
				this.public_work();
			}
		}
	}

	private isAllFree() {
		return this.isEdit ? this.editParam.gl.every(_ => _.p === 0) : this.publishParam.gl.every(_ => _.p === 0);
	}

	private sure_edit() {
		this.api
			.updateWork({
				w: this.editParam.w,
				d: this.editParam.d,
				i: this.editParam.f,
				t: this.editParam.t,
				b: this.editParam.b,
				n: this.editParam.n,
				gl: this.editParam.gl,
				bv: this.editParam.bv,
			})
			.subscribe({
				next: () => {
					this.modal.open(SuccessTips,{
						redirectUrl: 'user',
						tip: '已成功提交审核，请等待后台人员审核!',
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

	private subscribeForm() {
		this.form.valueChanges
			.pipe(
				map((value) => {
					const gl = value.gl.length && value.gl.map(_ => ({ ..._,f: _.f?.token || _?.f?.url || '',p: _.fr ? 0 : _.p,s: _.fr ? -1 : _.s }));
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
						gl,
					};
				})
			)
			.subscribe((x) => {
				this.isEdit ? this.editParam = { ...this.editParam,...x } : this.publishParam = x;
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
		fromEvent(this.submitButton.nativeElement,'click')
			.pipe(debounce(() => interval(500)))
			.subscribe(() => {
				this.submit();
			});
	}
}
