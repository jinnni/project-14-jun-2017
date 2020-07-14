import {NgModule} from "@angular/core";
import {IonicPageModule} from "ionic-angular";
import {ProductCategoryPage} from "./product-category";
import {SearchBarHeaderModule} from "../../components/search-bar-header/search-bar-header.module";
import {ProductListPageModule} from "../product-list/product-list.module";

@NgModule({
  declarations: [
    ProductCategoryPage
  ],
  imports: [
    IonicPageModule.forChild(ProductCategoryPage),
    SearchBarHeaderModule,
    ProductListPageModule
  ],
  entryComponents: [
    ProductCategoryPage
  ]
})
export class ProductCategoryPageModule {

}
