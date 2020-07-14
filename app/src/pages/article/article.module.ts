import {NgModule} from "@angular/core";
import {ArticlePage} from "./article";
import {IonicPageModule} from "ionic-angular";
import {CustomHtmlPieceModule} from "../../components/custom-html-piece/custom-html-piece.module";
import {CommentPageModule} from "../comment/comment.module";

@NgModule({
  declarations: [
    ArticlePage
  ],
  imports: [
    IonicPageModule.forChild(ArticlePage),
    CustomHtmlPieceModule,
    CommentPageModule
  ],
  entryComponents: [
    ArticlePage
  ]
})
export class ArticlePageModule {

}
