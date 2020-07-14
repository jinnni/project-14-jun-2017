import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CampaignListPage} from './campaign-list';
import {CampaignItemComponent} from "./campaign-item/campaign-item";
import {CampaignBadgeIntroPageModule} from "../campaign-badge-intro/campaign-badge-intro.module";
import {CampaignBadgeListPageModule} from "../campaign-badge-list/campaign-badge-list.module";

@NgModule({
  declarations: [
    CampaignListPage,
    CampaignItemComponent
  ],
  imports: [
    IonicPageModule.forChild(CampaignListPage),
    CampaignBadgeIntroPageModule,
    CampaignBadgeListPageModule
  ]
})
export class CampaignListPageModule {
}
