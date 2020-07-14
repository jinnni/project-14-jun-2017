import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {NoticePage} from "./notice";
import {FooterMenuModule} from "../../components/footer-menu/footer-menu.module";
import {NoticeListPageModule} from "../notice-list/notice-list.module";

@NgModule({
  declarations: [
    NoticePage
  ],
  imports: [
    IonicPageModule.forChild(NoticePage),
    FooterMenuModule,
    NoticeListPageModule
  ]
})
export class NoticePageModule {
}
