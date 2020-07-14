import {NgModule} from '@angular/core';
import {IonicModule, IonicPageModule} from "ionic-angular";
import {QrCodeScanPageModule} from "../../pages/qr-code-scan/qr-code-scan.module";
import {BadgeListPageModule} from "../../pages/badge-list/badge-list.module";
import {FooterMenuComponent} from "./footer-menu.component";

@NgModule({
  declarations: [
    FooterMenuComponent
  ],
  imports: [
    IonicPageModule.forChild(FooterMenuComponent),
    QrCodeScanPageModule,
    BadgeListPageModule
  ],
  exports: [
    FooterMenuComponent
  ]
})
export class FooterMenuModule {
}
