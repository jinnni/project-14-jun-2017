import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ProfileMyReviewPage} from './profile-my-review';
import {ProfileReviewItemModule} from "../../components/profile-review-item/profile-review-item.module";
import {RatingModule} from "../../components/rating/rating.module";
@NgModule({
  declarations: [
    ProfileMyReviewPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyReviewPage),
    ProfileReviewItemModule,
    RatingModule
  ],
})
export class ProfileMyReviewPageModule {
}
