import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {InitialPage} from "./initial";
import {ProfilePageModule} from "../profile/profile.module";
import {UgcPageModule} from "../ugc/ugc.module";
import {TimeLinePageModule} from "../timeline/timeline.module";
import {ForgotPasswordPageModule} from "../forgot-password/forgot-password.module";
import {NoticePageModule} from "../notice/notice.module";
import {SignInUpPageModule} from "../sign-in-up/sign-in-up.module";
import {MoreContentPageModule} from "../more-content/more-content.module";
import {UserService} from "../../services/userService";
import {TokenService} from "../../services/tokenService";
import { LandingPageModule } from '../landing/landing.module';
import { StorageService } from '../../services/storageService';
import { NotificationService } from '../../services/notificationService';
import { QuickTryPageModule } from '../quick-try/quick-try.module';

@NgModule({
  declarations: [
    InitialPage
  ],
  imports: [
    IonicPageModule.forChild(InitialPage),
    ProfilePageModule,
    UgcPageModule,
    TimeLinePageModule,
    NoticePageModule,
    SignInUpPageModule,
    ForgotPasswordPageModule,
    MoreContentPageModule,
    LandingPageModule,
    QuickTryPageModule
  ],
  entryComponents: [
    InitialPage
  ],
  providers: [
    TokenService,
    StorageService,
    UserService
  ]
})
export class InitialPageModule {
}
