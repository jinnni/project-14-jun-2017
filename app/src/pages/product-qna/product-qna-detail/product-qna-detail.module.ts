import {NgModule} from "@angular/core";
import {ProductQnaDetailPage} from "./product-qna-detail";
import {IonicPageModule} from "ionic-angular";
import {QnaItemModule} from "../../../components/qna-item/qna-item.module";

@NgModule({
  declarations: [
    ProductQnaDetailPage
  ],
  imports: [
    IonicPageModule.forChild(ProductQnaDetailPage),
    QnaItemModule
  ],
  entryComponents: [
    ProductQnaDetailPage
  ],
  providers: []
})
export class ProductQnaDetailPageModule {

}
