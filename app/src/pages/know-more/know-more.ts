import {Component, ElementRef, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the KnowMorePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-know-more',
  templateUrl: 'know-more.html',
})
export class KnowMorePage {
  @ViewChild('detailDiv') detailDiv: ElementRef;
  title: string;
  detail: string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.title = this.navParams.get("title") || "Know More";

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad KnowMorePage');
    this.detail = this.navParams.get("detail") || null;
    console.log(this.detailDiv.nativeElement)
    this.detailDiv.nativeElement.innerHTML = this.detail;
  }

}
