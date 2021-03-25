import { DomSanitizer,SafeResourceUrl } from '@angular/platform-browser';
import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component,OnInit,ViewChild,ElementRef,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { debounce,map } from 'rxjs/operators';
import { FormArray,FormBuilder,Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject,fromEvent,interval } from 'rxjs';
import { emptyStringValidator,ModalService,validator,Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { ReleaseApiService } from '../../release-api.service';


@Component({
	selector: 'ivo-3dmodel',
	templateUrl: './3dModel-free.component.html',
	styleUrls: ['./3dModel-free.component.less'],
})
export class ThreeModelFreeComponent implements OnInit,AfterViewInit {
	constructor(
		public sanitizer: DomSanitizer,
		private fb: FormBuilder,
		private modal: ModalService,
		private route: ActivatedRoute,
		private api: ReleaseApiService,
		private cdr: ChangeDetectorRef) { }

	bvUrl: SafeResourceUrl;
	ESelectPreviewType: ('image' | 'tv')[] = [];
	@ViewChild('submitButton')
	submitButton: ElementRef;
	param: {
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
		gl: [];
	};
	form = this.fb.group({
		f: [[],Validators.required],
		n: ['',[Validators.required,emptyStringValidator()]],
		d: ['',[Validators.required,emptyStringValidator()]],
		t: [[]],
		b: ['',Validators.required],
		c: ['',Validators.required],
		bv: ['',Validators.required],
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

	get glArray() {
		return <FormArray>this.form.get('gl');
	}

	addGlItem() {
		this.glArray.push(this.fb.group({
			n: ['',Validators.required],
			f: ['',Validators.required]
		}))
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

	changeSelectPreviewType(event: []) {
		this.ESelectPreviewType = [...event];
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
				this.api.get_edit_work(Number(x.get('id'))).subscribe((r: Work) => {
					console.log(r);
					this.copyrightModel = r.authority;
					this.form.patchValue({
						n: r.name,
						d: r.description,
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
			}
		});
	}

	private public_work() {
		this.api.publish_work({
			n: this.param.n,
			d: this.param.d,
			a: this.param.a,
			b: this.param.b,
			t: this.param.t,
			c: this.param.c,
			cs: this.param.cs,
			ss: this.param.ss,
			f: this.param.f,
			fr: 1,
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
		const i = this.setiToken();
		this.api
			.update_work({
				w: this.route.snapshot.params.id,
				d: this.form.value.d,
				i,
				t: this.form.value.t.join(','),
				b: this.form.value.b.token ?? this.form.value.b.url,
				n: this.form.value.n,
				a: this.copyrightModel,
				gl: [],
				fr: 1,
				gd: '',
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

	private setiToken() {
		const iUrl = this.form.value.f.map((s: any) => s.remote_token || s.url);

		const i = iUrl;
		return i;
	}

	private subscribeForm() {
		this.form.valueChanges
			.pipe(
				map((value: any) => {
					if (!this.isEdit) {
						value.b = value.b.token || '';
						value.f = value.f.map((s: { remote_token: string }) => s.remote_token);
						return {
							n: value.n,
							d: value.d,
							a: value.a,
							b: value.b,
							t: value.t.toString(),
							f: value.f,
							c: value.c,
							cs: 1,
							ss: 0,
							gl: [],
						};
					} else {
						return value;
					}
				})
			)
			.subscribe((x) => {
				console.log(this.form.value);
				this.param = x;
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
