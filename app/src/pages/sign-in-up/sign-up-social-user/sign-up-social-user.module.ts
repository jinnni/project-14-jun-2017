import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignUpSocialUserPage } from './sign-up-social-user';

@NgModule({
  declarations: [
    SignUpSocialUserPage,
  ],
  imports: [
    IonicPageModule.forChild(SignUpSocialUserPage),
  ],
})
export class SignUpSocialUserPageModule {}
