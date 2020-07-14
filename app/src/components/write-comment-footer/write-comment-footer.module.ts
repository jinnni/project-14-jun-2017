import {NgModule} from '@angular/core';
import {IonicModule, IonicPageModule} from 'ionic-angular';
import {WriteCommentFooterComponent} from "./write-comment-footer";

@NgModule({
  declarations: [
    WriteCommentFooterComponent
  ],
  imports: [
    IonicPageModule.forChild(WriteCommentFooterComponent)
  ],
  exports: [
    WriteCommentFooterComponent
  ]
})
export class WriteCommentFooterModule {
}
