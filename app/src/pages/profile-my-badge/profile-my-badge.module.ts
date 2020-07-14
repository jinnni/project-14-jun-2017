import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileMyBadgePage } from './profile-my-badge';

@NgModule({
  declarations: [
    ProfileMyBadgePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyBadgePage),
  ],
})
export class ProfileMyBadgePageModule {}
