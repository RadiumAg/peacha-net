import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component,OnInit,ViewChild,ElementRef,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { debounce,map } from 'rxjs/operators';
import { FormBuilder,Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject,fromEvent,interval } from 'rxjs';
import { emptyStringValidator,ModalService,validator,Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { ReleaseApiService } from '../../release-api.service';


@Component({
	selector: 'ivo-3dmodel',
	templateUrl: './3dModel-only-show.component.html',
	styleUrls: ['./3dModel-only-show.component.less'],
})
export class ThreeModelOnlyShowComponent implements OnInit,AfterViewInit {
	constructor(
		public sanitizer: DomSanitizer,
		private fb: FormBuilder,
		private modal: ModalService,
		private route: ActivatedRoute,
		private api: ReleaseApiService,
		private cdr: ChangeDetectorRef) { }

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
		f: [];
		bv: string;
	};

	editParam: {
		n: string;
		d: string;
		a: number;
		b: string;
		t: string;
		c: number;
		cs: number;
		f: [];
		bv: string;
	};

	form = this.fb.group({
		f: [[]],
		n: ['',[Validators.required,emptyStringValidator()]],
		d: ['',[Validators.required,emptyStringValidator()]],
		t: [[]],
		b: ['',Validators.required],
		c: ['',Validators.required],
		bv: [''],
		a: [[]],
		checked: [false,Validators.requiredTrue],
		gl: this.fb.array([]),
	});

	checkedForm = this.fb.group({
		aCheckedOne: [false],
		aCheckedTwo: [false],
		copyright: [[]],
		copychecked: [false],
		selectPreViewImage: [false],
		selectPreViewTv: [false]
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

	changeCopyright($event: number[]) {
		this.form.patchValue({
			a: $event,
		});
	}

	setBvNumber(bvNumber: string) {
		if (bvNumber === '') {
			this.modal.open(PopTips,['请输入bv号'])
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


	private getEditWork() {
		this.route.paramMap.subscribe(x => {
			if (x.get('id')) {
				this.isEdit = true;
				this.api.getEditWork(parseInt(x.get('id'),10)).subscribe((r: Work) => {
					this.setPreviewType(r);
					this.copyrightModel = r.authority;
					console.log(r.bvNumber);

					this.form.patchValue({
						n: r.name,
						d: r.description,
						bv: r.bvNumber,
						b: { url: r.cover },
						t: r.tag,
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
			bv: this.publishParam.bv,
			cs: 2,
			f: this.publishParam.f,
			gl: [],
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

	trackBy(index: number,model: { symbol: symbol }): symbol {
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
			this.modal.open(PopTips,['请选择预览方式','0']);
			return;
		}
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
				bv: this.editParam.bv,
				gl: [],
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
					};
				})
			)
			.subscribe((x) => {
				this.isEdit ? this.editParam = x : this.publishParam = x;
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
