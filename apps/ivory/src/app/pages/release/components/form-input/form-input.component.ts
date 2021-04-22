import { NG_VALUE_ACCESSOR,ControlValueAccessor } from '@angular/forms';
import { Component,Input,OnInit,forwardRef,ChangeDetectorRef,Output,EventEmitter,ElementRef } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';

@Component({
  selector: 'ivo-form-input',
  templateUrl: './form-input.component.html',
  styleUrls: ['./form-input.component.less'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => FormInputComponent),
    multi: true,
  }]
})
export class FormInputComponent implements OnInit,ControlValueAccessor {

  constructor(
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private focusMonitor: FocusMonitor) { }

  @Input()
  ivoDisabled = false;
  @Input()
  ivoPlaceholder = '';
  @Input()
  ivoValue = '';
  @Input()
  ivoMaxLength = 20;
  @Input()
  ivoMinLength = 0;
  @Output()
  ivoValueChange = new EventEmitter<string>();

  onChange: (value: string) => void = () => { };
  onTouched: () => void = () => { };

  innerInputChange(inputValue: string) {
    if (!this.ivoDisabled) {
      if (inputValue.length > this.ivoMaxLength) {
        inputValue = inputValue.slice(0,this.ivoMaxLength);
      }
      if (inputValue.length < this.ivoMinLength) {
        inputValue = inputValue.slice(0,this.ivoMinLength);
      }
      this.ivoValue = inputValue;
      this.onChange.call(this,inputValue);
      this.ivoValueChange.emit(inputValue);
    }
  }

  writeValue(value: string): void {
    this.ivoValue = value;
    this.cdr.markForCheck();
  }

  registerOnChange(value: (string) => void): void {
    this.onChange = value;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.ivoDisabled = isDisabled;
  }

  private validator() {

  }

  ngOnInit(): void {
    this.focusMonitor.monitor(this.elementRef,true).subscribe(focusOrgin => {
      if (!focusOrgin) {
        Promise.resolve().then(() => this.onTouched());
      }
    });
  }

}
