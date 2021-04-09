import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectorRef,Component,ElementRef,EventEmitter,forwardRef,Input,OnInit,Output,ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ivo-form-price-input',
  templateUrl: './form-price-input.component.html',
  styleUrls: ['./form-price-input.component.less'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormPriceInputComponent),
    multi: true,
  }]
})
export class FormPriceInputComponent implements OnInit {
  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private focusMonitor: FocusMonitor) { }
  @ViewChild('price_input')
  input: ElementRef<HTMLInputElement>
  @Input()
  ivoDisabled = false;
  @Input()
  ivoPlaceholder = '';
  @Input()
  ivoValue = 0;
  @Input()
  ivoMaxValue = 999999;
  @Input()
  ivoMinValue = 0;
  @Output()
  ivoValueChange = new EventEmitter<number>();

  onChange: (value: number) => void = () => { };
  onTouched: () => void = () => { };

  innerInputChange(inputValue: number) {
    if (!this.ivoDisabled) {
      if (inputValue > this.ivoMaxValue) {
        inputValue = this.ivoMaxValue;
      }
      if (inputValue < this.ivoMinValue) {
        inputValue = this.ivoMinValue;
      }
      this.ivoValue = inputValue;
      this.input.nativeElement.value = inputValue.toString();
      this.onChange.call(this,inputValue);
      this.ivoValueChange.emit(inputValue);
    }
  }

  writeValue(value: number): void {
    this.ivoValue = value;
    this.cdr.markForCheck();
  }

  registerOnChange(value: (value: number) => void): void {
    this.onChange = value;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.ivoDisabled = isDisabled;
  }

  ngOnInit(): void {
    this.ivoValue = 1000;
    this.focusMonitor.monitor(this.elementRef,true).subscribe(focusOrgin => {
      if (!focusOrgin) {
        Promise.resolve().then(() => this.onTouched());
      }
    });
  }


}
