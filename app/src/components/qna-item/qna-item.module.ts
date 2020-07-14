import {NgModule} from "@angular/core";
import {QnaItemComponent} from "./qna-item.component";
import {IonicPageModule} from "ionic-angular";
import {LikeService} from "../../services/likeService";
import {QnaService} from "../../services/qnaService";
import {ProductService} from "../../services/productService";
import {ProfilePublicPageModule} from "../../pages/profile-public/profile-public.module";

@NgModule({
  declarations: [
    QnaItemComponent
  ],
  imports: [
    IonicPageModule.forChild(QnaItemComponent),
    ProfilePublicPageModule
  ],
  exports: [
    QnaItemComponent
  ],
  providers: [
    LikeService,
    QnaService,
    ProductService
  ]
})
export class QnaItemModule {

}
