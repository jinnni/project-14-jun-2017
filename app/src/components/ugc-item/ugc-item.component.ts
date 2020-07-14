import {Component, Input} from '@angular/core';
import {Ugc} from "../../data/ugc.interface";
import {NavController} from "ionic-angular";
import {UgcDetailPage} from "../../pages/ugc-detail/ugc-detail";

@Component({
  selector: 'component-ugc-item',
  templateUrl: 'ugc-item.html',
})
export class UgcItemComponent {

  @Input() ugcData: Ugc;

  constructor(private navCtrl: NavController) {
  }

  showUgcDetail() {
    this.navCtrl.push(UgcDetailPage, {
      id: this.ugcData.id
    });
  }
}
