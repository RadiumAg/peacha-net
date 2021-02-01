import { Component, ViewChildren, QueryList, Input, ContentChildren, ViewContainerRef } from '@angular/core';
import { ErrorDisplayCase } from './error-display-case';
import { AbstractControl } from '@angular/forms';

@Component({
    selector: '*[errorDisplay]',
    template: `<ng-content></ng-content>`,
    inputs: [
        'errorDisplay'
    ],
    styles: []
})
export class ErrorDisplay {

    @ContentChildren(ErrorDisplayCase) cases: QueryList<ErrorDisplayCase>;
    @Input('errorDisplay') cont: AbstractControl;

    ngDoCheck(){
        if (!this.cont){
            return;
        }
        const cont = this.cont;
        if (!cont.touched){
            return;
        }
        let errorDisplayed = false;
        this.cases.forEach((ca, i, a) => {
            ca.vc.clear();
            if (!errorDisplayed){
                if (cont.hasError(ca.case)){
                    errorDisplayed = true;
                    ca.vc.createEmbeddedView(ca.template);
                }
            }
        });
    }
}
