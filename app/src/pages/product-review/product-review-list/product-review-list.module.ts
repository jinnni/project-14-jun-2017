import {NgModule} from "@angular/core";
import {ProductReviewListPage} from "./product-review-list";
import {IonicPageModule} from "ionic-angular";
import {RatingModule} from "../../../components/rating/rating.module";
import {IonicImageLoader} from "ionic-image-loader";

@NgModule({
  declarations: [
    ProductReviewListPage
  ],
  imports: [
    IonicPageModule.forChild(ProductReviewListPage),
    IonicImageLoader,
    RatingModule
  ],
  entryComponents: [
    ProductReviewListPage
  ]
})
export class ProductReviewListPageModule {

}
