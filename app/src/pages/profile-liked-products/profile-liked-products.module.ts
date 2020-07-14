import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileLikedProductsPage } from './profile-liked-products';
import {RatingModule} from "../../components/rating/rating.module";

@NgModule({
  declarations: [
    ProfileLikedProductsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileLikedProductsPage),
    RatingModule
  ],
})
export class ProfileLikedProductsPageModule {}
