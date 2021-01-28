import { Component } from '@angular/core';
import { Router } from '@angular/router';



@Component({
    selector: 'ivo-manager',
    templateUrl: './manager.page.html',
    styleUrls: ['./manager.page.less'],
})
export class ManagerPage {

    constructor(private router: Router) {

    }


    edit(c: number, id: number) {
        if (Number(c)) {
            this.router.navigate(['/edit/illust', id]);
        } else {
            this.router.navigate(['/edit/live2d', id]);
        }
    }
}
