import {NgModule} from "@angular/core";
import {BadgeDetailPage} from "./badge-detail";
import {IonicPageModule} from "ionic-angular";

@NgModule({
  declarations: [
    BadgeDetailPage
  ],
  imports: [
    IonicPageModule.forChild(BadgeDetailPage)
  ]
})
export class BadgeDetailPageModule {

}
