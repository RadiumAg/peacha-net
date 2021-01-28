import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export const SELECT_FATHER = new InjectionToken<SelectFather>('select_father');
export interface SelectFather {
  onOptionClick(option: any): void;
  optionClicked: BehaviorSubject<any>;
}
