import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {RatingModule} from "../../components/rating/rating.module";
import { SearchedProductListPage } from './searched-product-list';

@NgModule({
  declarations: [
    SearchedProductListPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchedProductListPage),
    RatingModule,
  ],
})
export class SearchedProductListPageModule {}
