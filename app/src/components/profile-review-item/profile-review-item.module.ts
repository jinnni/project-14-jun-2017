import {NgModule} from "@angular/core";
import {IonicModule, IonicPageModule} from "ionic-angular";
import {ProfileReviewItemComponent} from "./profile-review-item";
import {RatingModule} from "../rating/rating.module";

@NgModule({
  declarations: [
    ProfileReviewItemComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfileReviewItemComponent),
    RatingModule
  ],
  exports: [
    ProfileReviewItemComponent
  ]
})
export class ProfileReviewItemModule {

}
