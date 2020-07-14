import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileSettingsNotificationPage } from './profile-settings-notification';

@NgModule({
  declarations: [
    ProfileSettingsNotificationPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileSettingsNotificationPage),
  ],
})
export class ProfileSettingsNotificationPageModule {}
