import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {CommentPage} from './comment';
//import {CommentFieldModule} from "../../components/comment-field/comment-field.module";
import {WriteCommentFooterModule} from "../../components/write-comment-footer/write-comment-footer.module";

@NgModule({
  declarations: [
    CommentPage,
  ],
  imports: [
    IonicPageModule.forChild(CommentPage),
   // CommentFieldModule,
    WriteCommentFooterModule
  ],
})
export class CommentPageModule {
}
