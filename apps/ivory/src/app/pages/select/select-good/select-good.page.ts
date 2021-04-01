import { FormBuilder } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';


@Component({
    selector: 'ivo-select-good',
    templateUrl: './select-good.page.html',
    styleUrls: ['./select-good.page.less'],
})
export class SelectGoodPage implements OnInit, OnDestroy {

    order = this.fb.control('0');
    orderSubscription: Subscription;

    time = this.fb.control('0');
    timeSubscription: Subscription;

    money = this.fb.control('0');
    moneySubscription: Subscription;

    format = this.fb.control('0');
    formatSubscription: Subscription;


    params$ = this.route.queryParams;


    constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) { }


    ngOnInit(): void {
        this.orderSubscription = this.order.valueChanges.pipe().subscribe(o => this.updateParams({ o }));
        this.timeSubscription = this.time.valueChanges.pipe().subscribe(dd => this.updateParams({ dd }));
        this.moneySubscription = this.money.valueChanges.pipe().subscribe(m => this.updateParams({ m }));
        this.formatSubscription = this.format.valueChanges.pipe().subscribe(ft => this.updateParams({ ft }));
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
        this.moneySubscription.unsubscribe();
        this.formatSubscription.unsubscribe();
    }





}
