import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ModalRef } from '@peacha-core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ivo-commission-registration',
  templateUrl: './commission-registration.html',
  styleUrls: ['./commission-registration.less'],
})
export class CommissionRegistration implements OnInit {
  registrationForm: FormGroup;

  next$ = new BehaviorSubject(0);

  constructor(
    private modalRef: ModalRef<CommissionRegistration>,
    private fb: FormBuilder
  ) {
    this.registrationForm = this.fb.group(
      {
        start_year: new FormControl(new Date().getFullYear()),
        start_month: new FormControl(new Date().getMonth() + 1),
        start_day: new FormControl(new Date().getDate()),
        time: new FormControl('', [
          Validators.required,
          Validators.pattern('^[1-9]([0-9])?$'),
        ]),
        money: new FormControl('', [
          Validators.required,
          Validators.max(99999),
          Validators.pattern(/^(\d){1,}0$/),
        ]),
        tips: new FormControl('', [Validators.maxLength(100)]),
      },
      { validators: this.dateValidator }
    );
  }

  statementForm = this.fb.group({
    x: [false, [Validators.requiredTrue]],
  });
  dateValidator: ValidatorFn = (
    control: FormGroup
  ): ValidationErrors | null => {
    const year = control.get('start_year');
    const month = control.get('start_month');
    const day = control.get('start_day');
    const res = /^[0-9]*[1-9][0-9]*$/;
    const month_res = /^(([1-9])|(1[0-2]))$/;

    if (
      res.test(year.value) &&
      month_res.test(month.value) &&
      res.test(day.value) &&
      year.value >= 2020
    ) {
      if (
        new Date(year.value + '/' + month.value + '/' + day.value).getTime() >=
        new Date(
          new Date().getFullYear() +
            '/' +
            (new Date().getMonth() + 1) +
            '/' +
            new Date().getDate()
        ).getTime()
      ) {
        if ([1, 3, 5, 7, 8, 10, 12].includes(Number(month.value))) {
          if (Number(day.value) > 31 || Number(day.value) < 1) {
            return { invaild: true };
          } else {
            return {};
          }
        } else if ([4, 6, 9, 11].includes(Number(month.value))) {
          if (Number(day.value) > 30 || Number(day.value) < 1) {
            return { invaild: true };
          } else {
            return {};
          }
        } else if (Number(month.value) === 2) {
          if (Number(year.value) % 4 === 0) {
            if (Number(day.value) > 29 || Number(day.value) < 1) {
              return { invaild: true };
            } else {
              return {};
            }
          } else {
            if (Number(day.value) > 28 || Number(day.value) < 1) {
              return { invaild: true };
            } else {
              return {};
            }
          }
        }
      } else {
        return { invaild: true };
      }
    } else {
      return { invaild: true };
    }
  };

  get time(): AbstractControl {
    return this.registrationForm.get('time');
  }

  get money(): AbstractControl {
    return this.registrationForm.get('money');
  }
  get tips(): AbstractControl {
    return this.registrationForm.get('tips');
  }

  ngOnInit(): void {}

  close(): void {
    this.modalRef.close();
    // console.log(new Date(this.registrationForm.value.start_year+'/'+this.registrationForm.value.start_month+'/'
    // +this.registrationForm.value.start_day).getTime())
  }

  pre(): void {
    this.next$.next(0);
    console.log(this.registrationForm.value);
  }

  sure(): void {
    if (this.statementForm.valid) {
      this.modalRef.close([1, this.registrationForm.value]);
    }
  }
}
