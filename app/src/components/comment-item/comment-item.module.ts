import {NgModule} from '@angular/core';
import {IonicModule, IonicPageModule} from 'ionic-angular';
import {CommentItemComponent} from "./comment-item";
// import {CommentCommentPage} from "../../pages/comment-comment/comment-comment";
import {WriteCommentFooterModule} from "../write-comment-footer/write-comment-footer.module";

@NgModule({
  declarations: [
    CommentItemComponent
    // , CommentCommentPage
  ],
  imports: [
    IonicPageModule.forChild(CommentItemComponent),
    WriteCommentFooterModule
  ],
  entryComponents: [
    //CommentCommentPage
  ],
  exports: [
    CommentItemComponent
  ]
})
export class CommentItemModule {
}
