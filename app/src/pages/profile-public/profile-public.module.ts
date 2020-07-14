import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ProfilePublicPage} from './profile-public';
import {ProductService} from "../../services/productService";
import {ProfileLikedProductsPageModule} from "../profile-liked-products/profile-liked-products.module";
import {ProfileMyReviewPageModule} from "../profile-my-review/profile-my-review.module";
import {ProfileMyQuestionPageModule} from "../profile-my-question/profile-my-question.module";
import {ProfileMyAnswerPageModule} from "../profile-my-answer/profile-my-answer.module";
import {ProfileMyBadgePageModule} from "../profile-my-badge/profile-my-badge.module";
import {RatingModule} from "../../components/rating/rating.module";
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProfilePublicPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePublicPage),
    ProfileLikedProductsPageModule,
    ProfileMyReviewPageModule,
    ProfileMyQuestionPageModule,
    ProfileMyAnswerPageModule,
    ProfileMyBadgePageModule,
    RatingModule,
    IonicImageLoader
  ],
  providers: [
    ProductService
  ]
})
export class ProfilePublicPageModule {
}
