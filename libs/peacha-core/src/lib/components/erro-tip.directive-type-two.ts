import { of } from 'rxjs';
import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { NgControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Directive({
  selector: '[ivoErroTipTwo]',
})
export class ErroTipDirectiveTwo implements OnInit {
  @Input() ivoErrorTipString?:
    | string
    | ValidationErrors
    | {
        [key: string]: any;
        order: number;
      }[];

  private lastChange: number;
  errElement;
  parentElement;
  constructor(
    private control: NgControl,
    private el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private re2: Renderer2
  ) {}

  /**
   * @description create the message
   */
  private createMessage(errorString: string): void {
    this.el.nativeElement.style.border = '1px solid red';
    if (!errorString.trim()) {
      return;
    }
    this.parentElement = this.re2.parentNode(this.el.nativeElement);
    this.errElement = this.re2.createElement('span') as HTMLElement;
    this.errElement.innerText = errorString;
    this.errElement.classList.add('commission-errors');
    this.re2.insertBefore(
      this.parentElement,
      this.errElement,
      this.el.nativeElement
    );
  }

  /**
   * @description remove the message
   */
  private removeMessage(): void {
    this.el.nativeElement.style.border = '';
    if (!this.errElement) {
      return;
    }
    this.re2.removeChild(this.parentElement, this.errElement);
  }

  ngOnInit(): void {
    let timer = null;
    this.control.statusChanges.subscribe((x) => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (x === 'INVALID') {
        if (this.errElement) {
          this.removeMessage();
        }
        this.lastChange = performance.now();
        if (typeof this.ivoErrorTipString === 'string') {
          timer = setTimeout(() => {
            this.createMessage(this.ivoErrorTipString.toString());
          }, 400);
        } else {
          const firstKey = Reflect.ownKeys(this.ivoErrorTipString)[0];
          if (isNaN(Number(firstKey))) {
            const errorList = this.ivoErrorTipString as ValidationErrors;
            const errors = this.control.errors;
            // tslint:disable-next-line: forin
            for (const key in errors) {
              for (const tipKey in errorList) {
                if (key === tipKey) {
                  timer = setTimeout(() => {
                    this.createMessage(errorList[key]);
                  }, 400);
                  return;
                }
              }
            }
          } else {
            this.ivoErrorTipString.sort((x, y) => {
              return x[Object.keys(x)[0]].order - y[Object.keys(y)[0]].order;
            });
            const errorList = this.ivoErrorTipString;
            const errors = this.control.errors;
            // tslint:disable-next-line: forin
            for (const key in errors) {
              for (const item of errorList as {
                [key: string]: any;
                order: number;
              }[]) {
                if (key === Object.keys(item)[0]) {
                  timer = setTimeout(() => {
                    this.createMessage(item[key].error);
                  }, 400);
                  return;
                }
              }
            }
          }
        }
      } else if (x === 'VALID') {
        this.removeMessage();
      }
    });
  }
}
