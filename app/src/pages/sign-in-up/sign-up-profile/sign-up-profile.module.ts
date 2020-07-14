import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SignUpProfilePage} from "./sign-up-profile";
import {SignUpInterestModule} from "../sign-up-interest/sign-up-interest.module";
import {UserService} from "../../../services/userService";

@NgModule({
  declarations: [
    SignUpProfilePage
  ],
  imports: [
    IonicPageModule.forChild(SignUpProfilePage),
    SignUpInterestModule
  ],
  providers: [
    UserService
  ]
})
export class SignUpProfileModule {
}
