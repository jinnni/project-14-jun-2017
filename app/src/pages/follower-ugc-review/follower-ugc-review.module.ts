import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FollowerUgcReviewPage } from './follower-ugc-review';
import { FollowerReviewsPageModule } from '../follower-reviews/follower-reviews.module';

@NgModule({
  declarations: [
    FollowerUgcReviewPage,
  ],
  imports: [
    IonicPageModule.forChild(FollowerUgcReviewPage),
    FollowerReviewsPageModule
  ],
})
export class FollowerUgcReviewPageModule {}
