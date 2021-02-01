import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'ivo-user-reset',
  templateUrl: './user-reset.page.html',
  styleUrls: ['./user-reset.page.less']
})
export class UserResetPage implements OnInit {
  resetForm: FormGroup;
  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.resetForm = this.fb.group({

      password: new FormControl('', [Validators.required, Validators.pattern('^(?![^a-zA-Z]+$)(?!\D+$)[a-zA-Z0-9!@#$%]{8,15}$'), Validators.minLength(6), Validators.maxLength(24)]),
      passwordNew: new FormControl('', [Validators.pattern('^(?![^a-zA-Z]+$)(?!\D+$)[a-zA-Z0-9!@#$%]{8,15}$'), Validators.minLength(6), Validators.maxLength(24), this.confirmationValidator]),
      passwordAgain: new FormControl('', [this.confirmValidator]),

    });
  }


  get passwordNew() {
    return this.resetForm.get('/api/v1/passwordNew');
  }
  get password() {
    return this.resetForm.get('/api/v1/password');
  }
  get passwordAgain() {
    return this.resetForm.get('/api/v1/passwordAgain');
  }


  ngOnInit(): void {
  }

  confirmValidator = (passwordAgain: FormControl): { [s: string]: boolean } => {
    if (!passwordAgain.value) {
      return { error: true, required: true };
    } else if (passwordAgain.value !== this.resetForm.controls.passwordNew.value) {
      return { confirm: true, error: true };
    }
    return {};
  }

  confirmationValidator = (passwordNew: FormControl): { [s: string]: boolean } => {
    if (!passwordNew.value) {
      return { required: true };
    } else if (passwordNew.value !== this.resetForm.controls.passwordAgain.value && this.passwordAgain?.touched) {
      return { confirm: true, error: true };
    }
    return {};
  }

  onSubmit() {
    if (this.resetForm.valid) {
      this.http.post('/api/v1/user/reset_password', {
        o: this.password?.value,
        n: this.passwordNew?.value
      }).subscribe(s => {
        // TODO: feedback
      });

    }
  }


}
