import {NgModule} from "@angular/core";
import {QrCodeScanPage} from "./qr-code-scan";
import {IonicPageModule} from "ionic-angular";
import {QRScanner} from "@ionic-native/qr-scanner/ngx";

@NgModule({
  declarations: [
    QrCodeScanPage
  ],
  imports: [
    IonicPageModule.forChild(QrCodeScanPage)
  ],
  entryComponents: [
    QrCodeScanPage
  ],
  providers: [
    QRScanner
  ]
})
export class QrCodeScanPageModule {

}
