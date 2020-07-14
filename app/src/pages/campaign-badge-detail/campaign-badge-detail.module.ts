import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampaignBadgeDetailPage } from './campaign-badge-detail';
import {ChallengeItemComponent} from "./challenge-item/challenge-item";
import {LocalImageRetriever} from "../../services/local-image-retriever/local-image-retriever";
import {CustomHtmlPieceModule} from "../../components/custom-html-piece/custom-html-piece.module";
import {CustomHtmlPageModule} from "../custom-html/custom-html.module";

@NgModule({
  declarations: [
    CampaignBadgeDetailPage,
    ChallengeItemComponent
  ],
  imports: [
    IonicPageModule.forChild(CampaignBadgeDetailPage),
    CustomHtmlPieceModule,
    CustomHtmlPageModule
  ],
  providers: [
    LocalImageRetriever
  ]
})
export class CampaignBadgeDetailPageModule {}
