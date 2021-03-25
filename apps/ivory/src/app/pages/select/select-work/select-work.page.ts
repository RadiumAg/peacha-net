import { FormBuilder } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';


@Component({
    selector: 'ivo-select-work',
    templateUrl: './select-work.page.html',
    styleUrls: ['./select-work.page.less'],
})
export class SelectWorkPage implements OnInit, OnDestroy {

    order = this.fb.control('0');
    orderSubscription: Subscription;

    time = this.fb.control('0');
    timeSubscription: Subscription;

    params$ = this.route.queryParams;

    constructor(private router: Router, private route: ActivatedRoute, private http: HttpClient, private fb: FormBuilder) { }


    ngOnInit(): void {
        this.orderSubscription = this.order.valueChanges.pipe().subscribe(o => this.updateParams({ o }));
        this.timeSubscription = this.time.valueChanges.pipe().subscribe(dd => this.updateParams({ dd }));
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
    }

}
