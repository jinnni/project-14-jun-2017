import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileMyLikePage } from './profile-my-like';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProfileMyLikePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyLikePage),
    IonicImageLoader
  ],
})
export class ProfileMyLikePageModule {}
