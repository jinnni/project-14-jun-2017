import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileMyPicturePage } from './profile-my-picture';
import {IonicImageViewerModule} from "ionic-img-viewer";
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProfileMyPicturePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyPicturePage),
    IonicImageViewerModule,
    IonicImageLoader
  ],
})
export class ProfileMyPicturePageModule {}
