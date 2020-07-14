import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PreSurveyCampaignPage } from './pre-survey-campaign';
import { TermConditionPageModule } from '../../pages/term-condition/term-condition.module';
import { DeliveryInfoPageModule } from '../../pages/delivery-info/delivery-info.module';
import {RatingModule} from "../../components/rating/rating.module";

@NgModule({
  declarations: [
    PreSurveyCampaignPage,
  ],
  imports: [
    IonicPageModule.forChild(PreSurveyCampaignPage),
    DeliveryInfoPageModule,
    RatingModule
  ],
})
export class PreSurveyCampaignPageModule {}
