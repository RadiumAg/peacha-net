import { Overlay } from '@angular/cdk/overlay';
import { Component, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';


@Component({
    selector: 'ivo-n7r-good-detail',
    templateUrl: './good-detail.html',
    styleUrls: ['./good-detail.less']
})
export class N7rNavbarComponent {

    constructor(
        private store: Store,
        private router: Router,
        private overlay: Overlay,
        private vc: ViewContainerRef,
    ) { }

}
