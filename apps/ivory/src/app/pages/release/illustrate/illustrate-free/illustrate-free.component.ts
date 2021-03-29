import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component,OnInit,ViewChild,ElementRef,AfterViewInit } from '@angular/core';
import { debounce,map } from 'rxjs/operators';
import { FormBuilder,Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject,fromEvent,interval } from 'rxjs';
import { emptyStringValidator,ModalService,validator,Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { ReleaseApiService } from '../../release-api.service';


@Component({
	selector: 'ivo-illustrate',
	templateUrl: './illustrate-free.component.html',
	styleUrls: ['./illustrate-free.component.less'],
})
export class IllustrateFreeComponent implements OnInit,AfterViewInit {
	@ViewChild('submitButton')
	submitButton: ElementRef;

	constructor(private fb: FormBuilder,private modal: ModalService,private route: ActivatedRoute,private api: ReleaseApiService) { }

	param: {
		n: string;
		d: string;
		a: number[];
		b: string;
		t: string;
		c: number;
		cs: number;
		ss: number;
		f: [];
		gl: [];
	};
	form = this.fb.group({
		f: [[],Validators.required],
		n: ['',[Validators.required,emptyStringValidator()]],
		d: ['',[Validators.required,emptyStringValidator()]],
		t: [[]],
		b: ['',Validators.required],
		c: ['',Validators.required],
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
		this.api.publishWork({
			n: this.param.n,
			d: this.param.d,
			a: this.param.a,
			b: this.param.b,
			t: this.param.t,
			c: this.param.c,
			cs: this.param.cs,
			ss: this.param.ss,
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
			.updateWork({
				w: this.route.snapshot.params.id,
				d: this.form.value.d,
				i,
				t: this.form.value.t.join(','),
				b: this.form.value.b.token ?? this.form.value.b.url,
				n: this.form.value.n,
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
			.subscribe((x: any) => {
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
