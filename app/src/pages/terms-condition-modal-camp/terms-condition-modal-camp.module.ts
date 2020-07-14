import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TermsConditionModalCampPage } from './terms-condition-modal-camp';
import { PreSurveyCampaignPageModule } from '../pre-survey-campaign/pre-survey-campaign.module';



@NgModule({
  declarations: [
    TermsConditionModalCampPage,
  ],
  imports: [
    IonicPageModule.forChild(TermsConditionModalCampPage),
    PreSurveyCampaignPageModule,
  ],
})
export class TermsConditionModalCampPageModule {}
