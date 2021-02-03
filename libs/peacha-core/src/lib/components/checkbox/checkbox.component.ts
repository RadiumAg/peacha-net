import { FocusMonitor } from '@angular/cdk/a11y';
import { Input, Output, EventEmitter, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: '[ivo-checkbox]',
  exportAs: 'ivoCheckbox',
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./checkbox.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
		<span class="ivo-checkbox" [class.ivo-checkbox-checked]="ivoChecked">
			<input
				#inputElement
				type="checkbox"
				class="ivo-checkbox-input"
				[checked]="ivoChecked"
				[ngModel]="ivoChecked"
				(ngModelChange)="innerCheckedChange($event)"
				(click)="$event.stopPropagation()"
			/>
			<span class="ivo-checkbox-inner"></span>
		</span>
		<span class="text"><ng-content></ng-content></span>
	`,

  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    '(click)': 'hostClick($event)',
  },
})
export class CheckboxComponent implements ControlValueAccessor {
  constructor(private elementRef: ElementRef<HTMLElement>, private cdr: ChangeDetectorRef, private focusMonitor: FocusMonitor) { }

  @ViewChild('inputElement', { static: true })
  private inputElement!: ElementRef<HTMLInputElement>;
  @Input() ivoChecked = false;
  @Input() ivoDisabled = false;
  @Output() readonly ivoCheckedChange = new EventEmitter<boolean>();

  onChange: (checked: boolean) => void;
  innerCheckedChange(checked: boolean): void {
    if (!this.ivoDisabled) {
      this.ivoChecked = checked;
      this.onChange(this.ivoChecked);
      this.ivoCheckedChange.emit(this.ivoChecked);
    }
  }

  hostClick(e: MouseEvent): void {
    e.preventDefault();
    this.innerCheckedChange(!this.ivoChecked);
  }

  writeValue(value: boolean): void {
    this.ivoChecked = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }

}
