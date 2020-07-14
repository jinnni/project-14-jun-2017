import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateProductReviewPage } from './create-product-review';
import { RatingModule} from "../../components/rating/rating.module";

@NgModule({
  declarations: [
  ],
  imports: [
    IonicPageModule.forChild(CreateProductReviewPage),
    RatingModule
  ],
  entryComponents: [
    CreateProductReviewPage
  ]
})
export class CreateProductReviewPageModule {}
