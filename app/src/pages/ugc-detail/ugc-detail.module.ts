import {NgModule} from '@angular/core';
import {UgcDetailPage} from "./ugc-detail";
import {IonicPageModule} from "ionic-angular";
import {IonicImageViewerModule} from "ionic-img-viewer";
import {TwoWayUgcListModule} from "../../components/two-way-ugc-list/two-way-ugc-list.module";
import {CommentPageModule} from "../comment/comment.module";
import {CommentItemModule} from "../../components/comment-item/comment-item.module";
import { IonicImageLoader } from 'ionic-image-loader';
@NgModule({
  declarations: [
    UgcDetailPage
  ],
  imports: [
    IonicPageModule.forChild(UgcDetailPage),
    IonicImageViewerModule,
    TwoWayUgcListModule,
    CommentPageModule,
    IonicImageLoader,
    CommentItemModule,
  ]
})
export class UgcDetailPageModule {
}
