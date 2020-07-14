import {NgModule} from "@angular/core";
import {SearchBarHeaderComponent} from "./search-bar-header.component";
import {IonicModule, IonicPageModule} from "ionic-angular";
import {QrCodeScanPageModule} from "../../pages/qr-code-scan/qr-code-scan.module";
import { SearchedProductListPageModule } from "../../pages/searched-product-list/searched-product-list.module";
import { SearchedArticleListPageModule } from "../../pages/searched-article-list/searched-article-list.module";
import { SearchedUgcListPageModule } from "../../pages/searched-ugc-list/searched-ugc-list.module";
import { SearchedUserListPageModule } from "../../pages/searched-user-list/searched-user-list.module";

@NgModule({
  declarations: [
    SearchBarHeaderComponent
  ],
  imports: [
    IonicPageModule.forChild(SearchBarHeaderComponent),
    QrCodeScanPageModule,
    SearchedProductListPageModule,
    SearchedArticleListPageModule,
    SearchedUgcListPageModule,
    SearchedUserListPageModule
  ],
  exports: [
    SearchBarHeaderComponent
  ]
})
export class SearchBarHeaderModule {}
