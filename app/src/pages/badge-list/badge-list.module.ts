import {NgModule} from "@angular/core";
import {BadgeListPage} from "./badge-list";
import {IonicPageModule} from "ionic-angular";
import {BadgeService} from "../../services/badgeService";
import {HttpService} from "../../services/httpService";
import {BadgeDetailPageModule} from "../badge-detail/badge-detail.module";

@NgModule({
  declarations: [
    BadgeListPage
  ],
  imports: [
    IonicPageModule.forChild(BadgeListPage),
    BadgeDetailPageModule
  ],
  entryComponents: [
    BadgeListPage
  ],
  providers: [
    BadgeService,
    HttpService
  ]
})
export class BadgeListPageModule {
}
