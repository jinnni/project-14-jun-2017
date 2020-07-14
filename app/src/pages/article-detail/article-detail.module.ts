import {NgModule} from '@angular/core';
import {ArticleDetailPage} from "./article-detail";
import {IonicPageModule} from "ionic-angular";
import {IonicImageViewerModule} from "ionic-img-viewer";
import {TwoWayUgcListModule} from "../../components/two-way-ugc-list/two-way-ugc-list.module";
import {CommentPageModule} from "../comment/comment.module";
import {CommentItemModule} from "../../components/comment-item/comment-item.module";
import { IonicImageLoader } from 'ionic-image-loader';
import {FooterMenuModule} from "../../components/footer-menu/footer-menu.module";
@NgModule({
  declarations: [
    ArticleDetailPage
  ],
  imports: [
    IonicPageModule.forChild(ArticleDetailPage),
    IonicImageViewerModule,
    TwoWayUgcListModule,
    CommentPageModule,
    IonicImageLoader,
    CommentItemModule,
    FooterMenuModule
  ]
})
export class ArticleDetailPageModule {
}
