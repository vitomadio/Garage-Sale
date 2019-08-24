import { Component, OnInit, ViewChild} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service/auth.service';
//Import custom validator from helpers.
import { MustMatch } from '../../_helpers/must-match.validator';
import { User } from '../../../models/user';
import { Router } from '@angular/router'

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})

export class AuthComponent implements OnInit {

  public loginModal: boolean = false;
  public signupModal: boolean = false;
  public registerForm: FormGroup;
  public signinForm: FormGroup;
  public submitted = false;
  public user: User;
  public message: string;
  public messageClass: string;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  @ViewChild('childModal', { static: false }) childModal: ModalDirective;

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      userName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
        validator: MustMatch('password', 'confirmPassword')
      });
    this.signinForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  };

  get f() { return this.registerForm.controls; }
  get s() { return this.signinForm.controls; }

  showChildModal(modalType: string): any {
    if (modalType == 'login') {
      this.loginModal = true;
      this.signupModal = false;
    }
    else {
      this.loginModal = false;
      this.signupModal = true;
    }
    this.childModal.show();
  };

  hideChildModal(): void {
    this.message = null;
    this.messageClass = null;
    this.childModal.hide();
  };

  //Switch modal type Login/Signup.
  switchModal(modalType: string) {
    this.message = null;
    this.messageClass = null;
    if (modalType == 'login') {
      this.loginModal = true;
      this.signupModal = false;
    }
    else {
      this.loginModal = false;
      this.signupModal = true;
    }
  };

  onSubmit(type: string) {
    this.submitted = true;
    if (type == 'signup') {
      // stop here if form is invalid
      if (this.registerForm.invalid) {
        return;
      }
      this.authService.registerUser(this.registerForm.value)
        .subscribe(data => {
          if (!data) return console.log("Something wrong happened");
          if (data.success === false) {
            this.message = data.message;
            this.messageClass = 'text-danger';
          }
          else {
            this.message = data.message;
            this.messageClass = 'text-pink';
            setTimeout(() => {
              this.hideChildModal();
              this.message = null;
              this.messageClass = null;
            },3000)
          }
        });
      this.submitted = false;
      this.registerForm.reset();
    };
    //submit login.
    if (type == 'login') {
      // stop here if form is invalid
      if (this.signinForm.invalid) {
        return;
      }
      this.authService.loginUser(this.signinForm.value)
        .subscribe(data => {
          if (!data) {
            return console.log("Something happened.")
          }
          if (data.success === false) {
            this.message = data.message
            this.messageClass = data.success ? 'text-pink' : 'text-danger';
          } else {
            this.hideChildModal();
            this.router.navigateByUrl('/dashboard');
          }
        });
      this.submitted = false;
      this.signinForm.reset();
    }
  };

}
