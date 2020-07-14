import {NgModule} from "@angular/core";
import {ProductListPage} from "./product-list";
import {IonicPageModule} from "ionic-angular";
import {SearchBarHeaderModule} from "../../components/search-bar-header/search-bar-header.module";
import {RatingModule} from "../../components/rating/rating.module";
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    ProductListPage
  ],
  imports: [
    IonicPageModule.forChild(ProductListPage),
    SearchBarHeaderModule,
    RatingModule,
    IonicImageLoader
  ],
  entryComponents: [
    ProductListPage
  ]
})
export class ProductListPageModule {

}
