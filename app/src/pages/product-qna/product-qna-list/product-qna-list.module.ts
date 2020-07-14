import {NgModule} from "@angular/core";
import {ProductQnaListPage} from "./product-qna-list";
import {IonicPageModule} from "ionic-angular";
import {QnaItemModule} from "../../../components/qna-item/qna-item.module";

@NgModule({
  declarations: [
    ProductQnaListPage
  ],
  imports: [
    IonicPageModule.forChild(ProductQnaListPage),
    QnaItemModule
  ],
  entryComponents: [
    ProductQnaListPage
  ]
})
export class ProductQnaListPageModule {

}
