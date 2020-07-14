import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileMyUgcPage } from './profile-my-ugc';
import {TwoWayUgcListModule} from "../../components/two-way-ugc-list/two-way-ugc-list.module";
import { IonicImageLoader } from 'ionic-image-loader';
@NgModule({
  declarations: [
    ProfileMyUgcPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyUgcPage),
    TwoWayUgcListModule,
    IonicImageLoader
  ],
})
export class ProfileMyUgcPageModule {}
