import { Component, forwardRef, ViewChild, ElementRef, Input } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, Validators } from '@angular/forms';
import { Work, ModalService, Works, CooperateDetail, validator } from '@peacha-core';
import { CompanyModalComponent } from '../company-modal/company-modal.component';
import { UserStateModel } from '@peacha-core/state';

@Component({
	selector: 'ivo-select-company',
	templateUrl: './select-company.component.html',
	styleUrls: ['./select-company.component.less'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SelectCompanyComponent),
			multi: true,
		},
	],
})
export class SelectCompanyComponent implements ControlValueAccessor {
	isHaveCompany$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
	uid$: Subject<number> = new Subject();
	// eslint-disable-next-line @typescript-eslint/ban-types
	user$: Subject<object> = new Subject();
	precent$: BehaviorSubject<string> = new BehaviorSubject('0');
	workImg$ = new BehaviorSubject<Work>(null);
	uid: number;
	isSelectWork$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	@Input()
	ivoDisabled = false;

	@ViewChild('cover', { read: ElementRef })
	cover: ElementRef<any>;

	// eslint-disable-next-line @typescript-eslint/ban-types
	updata: (o: object) => void;

	form = this.fb.group({
		wr: [1],
		s: [0, Validators.min(0.01)],
		checked: [false, Validators.requiredTrue],
		cover: [0, Validators.min(1)],
		c: ['0'],
	});

	constructor(private modal: ModalService, private http: HttpClient, private fb: FormBuilder) {
		// this.form.valueChanges.subscribe((x) => console.log(x));
		this.uid$
			.pipe(
				tap(x => {
					const params = new HttpParams().set('i', x.toString());
					this.http.get(`/user/get_user`, { params }).subscribe(r => this.user$.next(r));
					this.uid = x;
				})
			)
			.subscribe();
	}

	cancel(e: Event) {
		this.isHaveCompany$.next(false);
	}

	writeValue(obj: any): void {
		this.form.patchValue({
			checked: true,
		});
		if (obj.cooperateid) {
			const params = new HttpParams().set('c', obj.cooperateid);
			this.http.get('/work/get_cooperate_detail', { params }).subscribe((x: CooperateDetail) => {
				this.isHaveCompany$.next(true);
				this.isSelectWork$.next(true);
				this.uid$.next(x.participate_userid);
				this.form.patchValue({
					s: Number(x.participate_share) * 100,
					wr: x.participate_category,
					cover: x.participate_cover,
				});
				this.workImg$.next({ cover: x.participate_cover });
				this.setPrecent({ process: Number(x.participate_share) });
			});
		}
	}

	registerOnChange(fn: any): void {
		this.updata = fn;
		this.isHaveCompany$.subscribe(x => {
			let summaryData: Observable<any>;
			if (x) {
				summaryData = null;
				summaryData = this.form.valueChanges;
				summaryData.subscribe(r => {
					if (!this.form.hasError) {
						validator(this.form, this.form.controls);
					}
					if (this.updata) {
						this.updata({
							wr: r.wr,
							s: r.s,
							statement: r.checked,
							r: r.cover,
							c: 0,
						});
					}
				});
				validator(this.form, this.form.controls);
			} else {
				summaryData = null;
				summaryData = this.form.valueChanges;
				summaryData.subscribe(_ => {
					if (this.updata) {
						this.updata({
							wr: 0,
							s: 0,
							r: 0,
							c: _.c,
							statement: undefined,
						});
					}
				});
			}
		});
	}

	registerOnTouched(fn: any): void { }

	setDisabledState?(isDisabled: boolean): void { }

	setPrecentSelf(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		this.precent$.next(value);
	}

	addCompany() {
		this.modal
			// eslint-disable-next-line @typescript-eslint/ban-types
			.open<CompanyModalComponent<UserStateModel>, object>(CompanyModalComponent, {
				findKey: 'k',
				pageKey: 'p',
				pageSizeKey: 's',
				searchKey: [],
				target: '/user/search',
				title: '选择合作者',
				tips: 'TIPS：为保障您与合作者的利益，避免不必要的纠纷，请您详细商定分成事宜后再发起合作',
				imgprototype: 'avatar',
				titleprototype: 'nickname',
				idprototype: 'uid',
				imgStyle: 'circul',
			})
			.afterClosed()
			.subscribe((x: Map<string, { select: boolean; uid: number }>) => {
				if (x) {
					const { select, uid } = x.get('res');
					this.isHaveCompany$.next(select);
					this.uid$.next(uid);
				}
			});
	}

	setPrecent(e: { process: number }) {
		this.precent$.next((e.process * 100).toFixed(0));
	}

	addAssociation(e: Event) {
		this.modal
			// eslint-disable-next-line @typescript-eslint/ban-types
			.open<CompanyModalComponent<Works>, object>(CompanyModalComponent, {
				findKey: 'k',
				pageKey: 'p',
				pageSizeKey: 's',
				searchKey: [{ u: this.uid }, { c: 1 }, { s: 10 }],
				target: '/work/get_works',
				title: '选择关联作品',
				imgprototype: 'cover',
				titleprototype: 'name',
				idprototype: 'id',
				imgStyle: 'react',
				symbolprototype: 'publishtime',
			})
			.afterClosed()
			.subscribe((x: Map<string, { select: boolean; id: string }>) => {
				if (x) {
					const { select, id } = x.get('res');
					this.http.get(`/work/get_work?w=${id}`).subscribe((x: Work) => {
						this.setImg(x, e);
					});
				}
			});
	}

	private setImg(x: Work, e: Event) {
		this.workImg$.next(x);
		this.isSelectWork$.next(true);
		this.form.get('cover').patchValue(x.id);
	}

	deleteWork(e: Event) {
		this.isSelectWork$.next(false);
	}

	onClick(e: Event) {
		if (this.ivoDisabled) {
			return;
		}
		const element = e.target as HTMLElement;
		element.classList.toggle('active');
	}

	seletOrgin(e: Event) { }

}
