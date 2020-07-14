import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SignInUpPage} from './sign-in-up';
import {SignInComponent} from "./sign-in/sign-in.component";
import {SignUpComponent} from "./sign-up/sign-up.component";
import {SignUpProfileModule} from "./sign-up-profile/sign-up-profile.module";
import {SignUpSocialUserPageModule} from "./sign-up-social-user/sign-up-social-user.module";
import {UserService} from "../../services/userService";
import {TokenService} from "../../services/tokenService";

@NgModule({
  declarations: [
    SignInUpPage,
    SignInComponent,
    SignUpComponent
  ],
  imports: [
    IonicPageModule.forChild(SignInUpPage),
    SignUpProfileModule,
    SignUpSocialUserPageModule
  ],
  providers: [
    UserService,
    TokenService
  ]
})
export class SignInUpPageModule {
}
