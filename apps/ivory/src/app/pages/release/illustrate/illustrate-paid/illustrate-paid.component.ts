import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component,OnInit,ViewChild,ElementRef,AfterViewInit } from '@angular/core';
import { debounce,map } from 'rxjs/operators';
import { FormBuilder,FormControl,Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject,fromEvent,interval } from 'rxjs';
import { emptyStringValidator,live2dPriceValidator,ModalService,validator,Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { ReleaseApiService } from '../../release-api.service';


@Component({
	selector: 'ivo-illustrate',
	templateUrl: './illustrate-paid.component.html',
	styleUrls: ['./illustrate-paid.component.less'],
})
export class IllustratePaidComponent implements OnInit,AfterViewInit {
	@ViewChild('submitButton')
	submitButton: ElementRef;

	constructor(private fb: FormBuilder,private modal: ModalService,private route: ActivatedRoute,private api: ReleaseApiService) { }

	Fixed = Number.prototype.toFixed;
	illustGoodsId: number = undefined;
	param: {
		[keys: string]: any;
	};

	editParam: Partial<{
		w: number;
		n: string;
		d: string;
		f: string[];
		b: string;
		t: string;
		gl: any[];
	}>;

	form = this.fb.group({
		f: [[],Validators.required],
		n: ['',[Validators.required,emptyStringValidator()]],
		d: ['',[Validators.required,emptyStringValidator()]],
		t: [[]],
		b: ['',Validators.required],
		c: [0,Validators.required],
		p: [null,[live2dPriceValidator()]],
		gn: [null,Validators.required],
		gl_s: [1,Validators.required],
		gl_token: [null,Validators.required],
		a: [[]],
		checked: [false,Validators.requiredTrue],
	});
	checkedForm = this.fb.group({
		aCheckedOne: [false],
		aCheckedTwo: [false],
		copyright: [[]],
		copychecked: [false],
	});
	copyrightCheckes$ = new BehaviorSubject<{ id: number; name: string }[]>([]);
	stateMentStates = [];
	maxPrice = 99999;
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
	call = (x: Function,y: any,...args) => x.call(y,args);
	private resetAChecked() {
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

	changeCopyright($event: number[]) {
		this.form.patchValue({
			a: $event,
		});
	}

	private getEditWork() {
		this.route.paramMap.subscribe(x => {
			if (x.get('id')) {
				this.isEdit = true;
				this.api.getEditWork(Number(x.get('id'))).subscribe((r: Work) => {
					this.illustGoodsId = r.goodsList[0].id;
					this.copyrightModel = r.authority;
					this.form.patchValue({
						n: r.name,
						d: r.description,
						b: { url: r.cover },
						t: r.tag,
						f: r.assets.map(_ => ({
							url: _,
						})),
						p: r.goodsList[0].price,
						gn: r.goodsList[0].name,
						gl_token: { url: r.goodsList[0].file,name: r.goodsList[0].file.slice(-39) },
						gl_s: r.goodsList[0].maxStock,
						c: r.copyright,
					});
				});
			}
		});
	}

	private public_work() {
		this.api.publishWork({
			n: this.param.n,
			d: this.param.d,
			a: this.param.a,
			b: this.param.b,
			t: this.param.t,
			c: this.param.c,
			cs: this.param.cs,
			f: this.param.f,
			gl: this.param.gl,
		}).subscribe({
			next: _x => {
				this.modal.open(SuccessTips,{
					redirectUrl: '/member/manager/illust/auditing',
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

	priceValidate(e: Event) {
		const price = e.target as HTMLInputElement;
		price.value.length > 5 ? (price.value = price.value.slice(0,price.value.length - 1)) :
			(price.value.includes('.') ? price.value = price.value.slice(0,price.value.lastIndexOf('.')) : '')
	}

	submit() {
		validator(this.form,this.form.controls);
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
				d: this.editParam.d,
				i: this.editParam.f,
				t: this.editParam.t,
				b: this.editParam.b,
				n: this.editParam.n,
				gl: this.editParam.gl,
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
					if (!this.isEdit) {
						value.b = value.b.token || value.b.url || '';
						value.f = value.f.map((s: { remote_token: string; url: string; }) => s.remote_token || s.url);
						return {
							n: value.n,
							d: value.d,
							a: value.a,
							b: value.b,
							t: value.t.toString(),
							f: value.f,
							c: value.c,
							cs: 1,
							gl: [{
								n: value.gn,
								f: value.gl_token?.token || '',
								p: value.p > this.maxPrice ? parseInt(((value.p + '').slice(0,(this.maxPrice + '').length)),10) : value.p,
								s: value.gl_s,
							}],
						};
					} else {
						value.b = value.b.token || value.b.url || '';
						value.f = value.f.map((s: { remote_token: string; url: string; }) => s.remote_token || s.url);
						return {
							w: this.illustGoodsId,
							n: value.n,
							d: value.d,
							b: value.b,
							t: value.t.toString(),
							f: value.f,
							gl: [{
								n: value.gn,
								f: value.gl_token?.token || value.gl_token?.url || '',
								s: value.gl_s,
							}],
						};
					}
				})
			)
			.subscribe((x) => {
				this.isEdit ? this.editParam = x : this.param = x;
			});
	}

	private setInitstateMentStates() {
		this.copyrightCheckes$.subscribe(x => {
			this.stateMentStates = x.map(_ => true);
		});
	}

	private getCopyRight() {
		this.api.copyright(1).subscribe((x: { list: { name: string; id: number }[] }) => {
			this.copyrightCheckes$.next(x.list);
			this.setInitstateMentStates();
		});
	}

	private initForm() {
		if (this.isEdit) {
			const oldPrice = this.form.getRawValue().p;
			this.form.removeControl('p');
			this.form.addControl('p',new FormControl({ value: oldPrice,disabled: true },{ validators: live2dPriceValidator,}))
		}
	}

	ngOnInit() {
		this.getCopyRight();
		this.subscribeForm();
		this.getEditWork();
		this.initForm();
	}

	ngAfterViewInit() {
		fromEvent(this.submitButton.nativeElement,'click')
			.pipe(debounce(() => interval(500)))
			.subscribe(() => {
				this.submit();
			});
	}
}
