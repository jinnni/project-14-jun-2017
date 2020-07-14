import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NoticeListPage } from './notice-list';
import {DeliveryInfoPageModule} from "../delivery-info/delivery-info.module";
import {FooterMenuModule} from "../../components/footer-menu/footer-menu.module";
import {TermsConditionModalCampPageModule} from "../terms-condition-modal-camp/terms-condition-modal-camp.module";

@NgModule({
  declarations: [
    NoticeListPage,
  ],
  imports: [
    IonicPageModule.forChild(NoticeListPage),
    DeliveryInfoPageModule,
    FooterMenuModule,
    TermsConditionModalCampPageModule
  ],
})
export class NoticeListPageModule {}
