import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileSettingsFaqPage } from './profile-settings-faq';
import {ProfileSettingsFaqDetailPageModule} from "../profile-settings-faq-detail/profile-settings-faq-detail.module";

@NgModule({
  declarations: [
    ProfileSettingsFaqPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileSettingsFaqPage),
    ProfileSettingsFaqDetailPageModule
  ],
})
export class ProfileSettingsFaqPageModule {}
