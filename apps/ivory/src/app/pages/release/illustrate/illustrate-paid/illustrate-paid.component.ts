import { SuccessTips } from './../../components/success-tips/success-tips';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { debounce, map } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, fromEvent, interval } from 'rxjs';
import { emptyStringValidator, ModalService, validator, Work } from '@peacha-core';
import { PopTips } from '@peacha-core/components';
import { ReleaseApiService } from '../../release-api.service';


@Component({
	selector: 'ivo-illustrate',
	templateUrl: './illustrate-paid.component.html',
	styleUrls: ['./illustrate-paid.component.less'],
})
export class IllustratePaidComponent implements OnInit, AfterViewInit {
	@ViewChild('submitButton')
	submitButton: ElementRef;

	constructor(private fb: FormBuilder, private modal: ModalService, private route: ActivatedRoute, private api: ReleaseApiService) { }
    Fixed = Number.prototype.toFixed;
	param: {
	 [keys:string]: any;
	};
	form = this.fb.group({
		f: [[], Validators.required],
		n: ['', [Validators.required, emptyStringValidator()]],
		d: ['', [Validators.required, emptyStringValidator()]],
		t: [[]],
		b: ['', Validators.required],
		c: ['', Validators.required],
    p: ['', Validators.required],
    gl_token:[[],Validators.required],
    ss: [true],
		a: [[]],
		checked: [false, Validators.requiredTrue],
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
    call = (x: Function, y: any, ...args) => x.call(y, args);
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
				this.api.get_edit_work(Number(x.get('id'))).subscribe((r: Work) => {
					console.log(r);
					this.copyrightModel = r.authority;
					this.form.patchValue({
						n: r.name,
						d: r.description,
						b: { url: r.cover },
						t: r.tag,
						f: r.assets.map(_ => ({
								url: _,
						})),
						p: r.goods_list[0].price,
						gl_token: [{token: r.goods_list[0].file,url:'',name:r.goods_list[0].name}],
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
			fr: 0,
			gl: this.param.gl,
		  }).subscribe({
			next: _x => {
				this.modal.open(SuccessTips, {
					redirectUrl: '/member/manager/illust/auditing',
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
		validator(this.form, this.form.controls);
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
			.update_work({
				w: this.route.snapshot.params.id,
				d: this.param.d,
				i: this.param.f,
				t: this.param.t,
				b: this.param.b,
				n: this.param.n,
				a: this.copyrightModel,
				gl: this.param.gl,
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
				map((value) => {
					value.b = value.b.token || value.b.url || '';
					value.f = value.f.map((s: { remote_token: string;url:string; }) => s.remote_token || s.url);
					return {
						n: value.n,
						d: value.d,
						a: value.a,
						b: value.b,
						t: value.t.toString(),
						f: value.f,
						c: value.c,
						fr: 0,
						cs: 1,
						ss: value.ss? 1 : 2,
						gl: [{
							n: '付费下载内容',
							f: [value.gl_token[0]?  value.gl_token[0]?.token || value.gl_token[0].url : ''],
							p: value.p > this.maxPrice ? parseInt(((value.p + '').slice(0, (this.maxPrice + '').length)), 10) : value.p,
							s: value.s,
						   }],
				  };
					
				})
			)
			.subscribe((x) => {
				this.param = x;
				console.log(x);
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
		fromEvent(this.submitButton.nativeElement, 'click')
			.pipe(debounce(() => interval(500)))
			.subscribe(() => {
				this.submit();
			});
	}
}
