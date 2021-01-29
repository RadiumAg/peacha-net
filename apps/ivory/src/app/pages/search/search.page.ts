import { switchMap } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of, EMPTY, concat, Subscription, BehaviorSubject, Observable } from 'rxjs';

enum SearchType {
	Work,
	Good,
	User,
}

@Component({
	selector: 'ivo-search',
	templateUrl: './search.page.html',
	styleUrls: ['./search.page.less'],
})
export class SearchPage implements OnInit, OnDestroy {
	order = this.fb.control('0');
	orderSubscription: Subscription;

	time = this.fb.control('0');
	timeSubscription: Subscription;

	userOrder = this.fb.control('0');
	userOrderSubscription: Subscription;

	userType = this.fb.control('-1');
	userTypeSubscription: Subscription;

	keyword$ = new BehaviorSubject<string>('');
	label$ = this.route.queryParams.pipe(
		switchMap(s => {
			this.order.setValue(s.keyword === undefined ? 1 : s.o === undefined ? '0' : s.o, { emitEvent: false });
			this.time.setValue(s.dd === undefined ? '0' : s.dd, { emitEvent: false });
			this.userOrder.setValue(s.keyword === undefined ? 1 : s.o === undefined ? '0' : s.o, { emitEvent: false });
			this.userType.setValue(s.r === undefined ? '0' : s.r, {
				emitEvent: false,
			});
			this.keyword$.next(s.keyword === undefined ? '' : s.keyword);
			return this.http.get<any>(`/work/tag_count?t=${this.keyword$.value ?? ''}`);
		})
	);
	searchType$ = concat(
		this.getSearchTypeFromUrl(this.router.url),
		this.router.events.pipe(
			switchMap(event => {
				if (event instanceof NavigationEnd) {
					const url = event.urlAfterRedirects;
					return this.getSearchTypeFromUrl(url);
				}
				return EMPTY;
			})
		)
	);
	params$ = this.route.queryParams;

	constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private fb: FormBuilder) {}

	ngOnInit(): void {
		this.orderSubscription = this.order.valueChanges.pipe().subscribe(o => this.updateParams({ o }));
		this.timeSubscription = this.time.valueChanges.pipe().subscribe(dd => this.updateParams({ dd }));
		this.userOrderSubscription = this.userOrder.valueChanges.pipe().subscribe(o => this.updateParams({ o }));
		this.userTypeSubscription = this.userType.valueChanges.pipe().subscribe(r => this.updateParams({ r }));
	}

	updateParams(queryParams: object): void {
		this.router.navigate([], {
			queryParams,
			queryParamsHandling: 'merge',
		});
	}

	ngOnDestroy(): void {
		this.orderSubscription.unsubscribe();
		this.timeSubscription.unsubscribe();
		this.userOrderSubscription.unsubscribe();
		this.userTypeSubscription.unsubscribe();
	}

	getSearchTypeFromUrl(url: string): Observable<SearchType> {
		if (url.includes('search/good')) {
			return of(SearchType.Good);
		}
		if (url.includes('search/user')) {
			return of(SearchType.User);
		}
		return of(SearchType.Work);
	}
}
