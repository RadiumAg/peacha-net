import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Store, Select } from '@ngxs/store';

import { ActivatedRoute, Router } from '@angular/router';
import { UserState, IvoryError } from '@peacha-core';
import { UpdatePublicInformation } from 'libs/peacha-core/src/lib/core/state/user.action';
import { UserStateModel } from 'libs/peacha-core/src/lib/core/state/user.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'ivo-user-profile',
  templateUrl: './first-profile.page.html',
  styleUrls: ['./first-profile.page.less'],
})
export class FirstProfilePage {
  @Select(UserState.state)
  user$: Observable<UserStateModel>;

  detailsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.detailsForm = this.fb.group({
      avatar: new FormControl(''),
      nickname: new FormControl('', [
        Validators.maxLength(20),
        Validators.minLength(2),
        this.myPattern,
      ]),
      description: new FormControl('', [Validators.maxLength(160)]),
    });

    // this.detailsForm.valueChanges.subscribe(data => {
    //   console.log(data);
    // });

    this.user$.subscribe((i) => {
      this.nickname.setValue(i.nickname);
      this.description.setValue(i.description);
    });
  }

  get isDisabled() {
    return !this.detailsForm.touched
      ? 'disabled'
      : this.detailsForm.valid
      ? null
      : 'disabled';
  }

  get avatar() {
    return this.detailsForm.get('avatar');
  }
  get nickname() {
    return this.detailsForm.get('nickname');
  }
  get description() {
    return this.detailsForm.get('description');
  }

  goBack() {
    this.route.queryParams.subscribe((s) => {
      if (s.return) {
        this.router.navigate([s.return]);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  appendProfile() {
    if (this.detailsForm.valid) {
      this.store
        .dispatch(
          new UpdatePublicInformation(
            this.detailsForm.value.nickname,
            this.detailsForm.value.description,
            this.detailsForm.value.avatar
          )
        )
        .subscribe(
          (s) => {
            this.route.queryParams.subscribe((s) => {
              if (s.return) {
                this.router.navigate([s.return]);
              } else {
                this.router.navigate(['/']);
              }
            });
          },
          (e) => {
            if (e instanceof IvoryError) {
              const error: {
                second?: boolean;
              } = {};
              switch (e.code) {
                case 105:
                  error.second = true;
              }
              this.nickname.setErrors(error);
            }
          }
        );
    }
  }

  myPattern(control: AbstractControl) {
    const result = /^[_,\-,0-9,a-z,A-z,\u3040-\u30ff,\u31f0-\u31ff,\u1100-\u11ff,\u3400-\u4db5,\u4e00-\u9fa5,\u9fa6-\u9fbb,\uf900-\ufa2d,\ufa30-\ufa6a,\ufa70-\ufad9,\u20000-\u2a6d6,\u2f800-\u2fa1d]+$/.test(
      control.value
    );
    return result ? null : { myPattern: { value: control.value } };
  }
}
