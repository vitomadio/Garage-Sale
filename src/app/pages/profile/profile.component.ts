import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidateEmail, SanitizeText } from '../../validators/form.validators';
import { AuthService } from '../../services/auth-service/auth.service';
import { ProfileService } from '../../services/profile/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public specialCaraters: string = "(\-,.*+?^$[](){}!=|)";
  public profileForm: FormGroup;
  public imageForm: FormGroup;
  public currentUser: any;
  public selectedFile: File = null;
  public imageUrl: any = null;

  @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.authService.currentUser
      .subscribe(user => this.currentUser = user);
      
    this.profileForm = this.formBuilder.group({
      firstName: ['', SanitizeText],
      lastName: ['', SanitizeText],
      email: ['', ValidateEmail],
      userName: ['', SanitizeText],
    });

    this.profileForm.patchValue({
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      userName: this.currentUser.userName,
      email: this.currentUser.email
    });

  }

  get p() { return this.profileForm.controls; } //This is to grab form easelly.

  //OPEN MODAL.
  showChildModal(): void {
    this.childModal.show();
  }
  //CLOSE MODAL.
  hideChildModal(): void {
    this.childModal.hide();
  }
  //CHANGE AVATAR.
  onFileSelected(event): void {
    this.selectedFile = <File>event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (_event) => {
      this.imageUrl = reader.result;
    }
  }
  //SAVE PROFILE CHANGES
  saveChanges() {
    const fd = new FormData();
    //If there's a new avatar image selected.
    if (this.selectedFile) {
      fd.append('avatar', this.selectedFile);
      for (var key in this.profileForm.value) {
        fd.append(key, this.profileForm.value[key]);
      }
      fd.append('prevUrl', this.currentUser.avatar);
      this.profileService.saveProfileChanges(fd, null)
        .subscribe(data => {
          console.log(data);
          this.hideChildModal();
        })
    }
    else { // Only change forms inputs
      this.profileService.saveProfileChanges(null, this.profileForm.value)
        .subscribe(data => {
          console.log(data, 'from profile component');
          this.hideChildModal();
        })
    }
  }


}
