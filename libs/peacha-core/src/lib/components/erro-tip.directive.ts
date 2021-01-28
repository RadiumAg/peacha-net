import {
  Directive,
  Input,
  AfterContentInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { NgControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';

@Directive({
  selector: '[ivoErroTip]',
})
export class ErroTipDirective implements OnChanges {
  @Input() ivoErrorTipString?: string | ValidationErrors;

  private lastChange: number;

  constructor(private control: NgControl, private message: NzMessageService) {}

  ngOnChanges(changes: SimpleChanges): void {
    let timer;
    this.control.statusChanges.subscribe((x) => {
      if (x === 'INVALID') {
        if (timer) {
          clearTimeout(timer);
        }

        this.lastChange = performance.now();
        if (typeof this.ivoErrorTipString === 'string') {
          timer = setTimeout(() => {
            this.message.error(this.ivoErrorTipString as string);
          }, 400);
        } else {
          const errorList = this.ivoErrorTipString as ValidationErrors;
          const errors = this.control.errors;
          // tslint:disable-next-line: forin
          for (const key in errors) {
            for (const tipKey in errorList) {
              if (key === tipKey) {
                timer = setTimeout(() => {
                  this.message.error(this.ivoErrorTipString[tipKey]);
                }, 400);
                return;
              }
            }
          }
        }
      }
    });
  }
}
