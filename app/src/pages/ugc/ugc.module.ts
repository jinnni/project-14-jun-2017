import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {UgcPage} from "./ugc";
import {FooterMenuModule} from "../../components/footer-menu/footer-menu.module";
import {ProductService} from "../../services/productService";
import {UgcService} from "../../services/ugcService";
import {ImageSlidesModule} from "../../components/image-slides/image-slides.module";
import {UgcDetailPageModule} from "../ugc-detail/ugc-detail.module";
import {ArticleDetailPageModule} from "../article-detail/article-detail.module";
import {TwoWayUgcListModule} from "../../components/two-way-ugc-list/two-way-ugc-list.module";
import {UgcCreatePage} from "../ugc-create/ugc-create";
import { IonicImageLoader } from 'ionic-image-loader';
import {SearchBarHeaderModule} from "../../components/search-bar-header/search-bar-header.module";
import {UgcSelectorPageModule} from "../ugc-selector/ugc-selector.module";
import { FollowerUgcReviewPageModule } from '../follower-ugc-review/follower-ugc-review.module';

@NgModule({
  declarations: [
    UgcPage,
    UgcCreatePage
  ],
  imports: [
    IonicPageModule.forChild(UgcPage),
    FooterMenuModule,
    ImageSlidesModule,
    UgcDetailPageModule,
    UgcSelectorPageModule,
    ArticleDetailPageModule,
    TwoWayUgcListModule,
    IonicImageLoader,
    SearchBarHeaderModule,
    FollowerUgcReviewPageModule
  ],
  entryComponents: [
    UgcCreatePage
  ],
  providers: [
    ProductService,
    UgcService
  ]
})
export class UgcPageModule {
}
