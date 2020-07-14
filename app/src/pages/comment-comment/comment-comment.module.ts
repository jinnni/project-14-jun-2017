import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CommentCommentPage} from './comment-comment';
import {CommentItemModule} from "../../components/comment-item/comment-item.module";

@NgModule({
  declarations: [
    CommentCommentPage
  ],
  imports: [
    IonicPageModule.forChild(CommentCommentPage),
    CommentItemModule
  ]
})
export class CommentCommentPageModule {
}
