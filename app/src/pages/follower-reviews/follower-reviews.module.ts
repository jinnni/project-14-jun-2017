import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FollowerReviewsPage } from './follower-reviews';
import { RatingModule } from '../../components/rating/rating.module';

@NgModule({
  declarations: [
    FollowerReviewsPage,
  ],
  imports: [
    IonicPageModule.forChild(FollowerReviewsPage),
    RatingModule
  ],
})
export class FollowerReviewsPageModule {}
