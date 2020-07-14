import {Component} from '@angular/core';
import {QRScanner} from "@ionic-native/qr-scanner/ngx";
import {NavController} from "ionic-angular";
import { resolve } from 'dns';

@Component({
  selector: 'page-qr-code-scan',
  templateUrl: 'qr-code-scan.html',
})
export class QrCodeScanPage {

  isLightEnabled: boolean = false;

  constructor(private qrScanner: QRScanner,
              private navCtrl: NavController) {

  }

  ionViewDidLoad() {
    this.scan();
  }

  scan() {
    window.document.querySelector('ion-app').classList.add('transparent-body');
    let scanSub = this.qrScanner.scan().subscribe(text => {
      console.log(text);
      this.qrScanner.hide();
      scanSub.unsubscribe();
      if (this.isLightEnabled) {
        this.qrScanner.disableLight();
      }
      this.qrScanner.destroy();
      this.navCtrl.pop();
    });
    this.qrScanner.show();
  }

  toggleLight() {
    if (!this.isLightEnabled) {
      this.qrScanner.enableLight();
      this.isLightEnabled = true;
    }
    else {
      this.qrScanner.disableLight();
      this.isLightEnabled = false;
    }
  }
}
