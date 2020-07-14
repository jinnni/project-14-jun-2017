import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CampaignBadgeIntroPage} from './campaign-badge-intro';
import {CampaignBadgeDetailPageModule} from "../campaign-badge-detail/campaign-badge-detail.module";
import {CustomHtmlPageModule} from "../custom-html/custom-html.module";

@NgModule({
  declarations: [
    CampaignBadgeIntroPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignBadgeIntroPage),
    CampaignBadgeDetailPageModule,
    CustomHtmlPageModule
  ],
})
export class CampaignBadgeIntroPageModule {
}
