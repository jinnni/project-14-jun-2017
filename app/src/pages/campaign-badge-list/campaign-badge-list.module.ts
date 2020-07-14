import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CampaignBadgeListPage} from './campaign-badge-list';
import {CampaignBadgeIntroPageModule} from "../campaign-badge-intro/campaign-badge-intro.module";

@NgModule({
  declarations: [
    CampaignBadgeListPage,
  ],
  imports: [
    IonicPageModule.forChild(CampaignBadgeListPage),
    CampaignBadgeIntroPageModule
  ],
})
export class CampaignBadgeListPageModule {
}
