import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TermConditionPage } from './term-condition';
import { PreSurveyCampaignPageModule } from '../pre-survey-campaign/pre-survey-campaign.module';

@NgModule({
  declarations: [
    TermConditionPage,
  ],
  imports: [
    IonicPageModule.forChild(TermConditionPage)
  ],
})
export class TermConditionPageModule {}
