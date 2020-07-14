import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoreContentPage } from './more-content';
import {RatingModule} from "../../components/rating/rating.module";
@NgModule({
  declarations: [
    MoreContentPage,
  ],
  imports: [
    IonicPageModule.forChild(MoreContentPage),
    RatingModule
  ],
})
export class MoreContentPageModule {}
