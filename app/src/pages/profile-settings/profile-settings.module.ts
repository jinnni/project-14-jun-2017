import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ProfileSettingsPage} from "./profile-settings";
import {LocalImageRetrieverProvider} from "../../services/local-image-retriever/local-image-retriever.provider";
import {ProfileSettingsModifyPage} from "../profile-settings-modify/profile-settings-modify";
import {ProfileSettingsPrivacyPageModule} from "../profile-settings-privacy/profile-settings-privacy.module";
import {ProfileSettingsNotificationPageModule} from "../profile-settings-notification/profile-settings-notification.module";
import {ProfileSettingsFaqPageModule} from "../profile-settings-faq/profile-settings-faq.module";
import {CustomHtmlPageModule} from "../custom-html/custom-html.module";
import {UserService} from "../../services/userService";

@NgModule({
  declarations: [
    ProfileSettingsPage,
    ProfileSettingsModifyPage
  ],
  imports: [
    IonicPageModule.forChild(ProfileSettingsPage),
    LocalImageRetrieverProvider,
    ProfileSettingsPrivacyPageModule,
    ProfileSettingsNotificationPageModule,
    ProfileSettingsFaqPageModule,
    CustomHtmlPageModule
  ],
  entryComponents: [
    ProfileSettingsModifyPage
  ],
  providers: [
    
    UserService
  ]
})
export class ProfileSettingsModule {
}
