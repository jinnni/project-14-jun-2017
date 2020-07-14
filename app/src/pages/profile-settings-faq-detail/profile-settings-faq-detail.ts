import {Component} from '@angular/core';
import {IonicPage, NavParams, Platform, NavController} from 'ionic-angular';
import { Util } from "../../global/util";
@IonicPage()
@Component({
  selector: 'page-profile-settings-faq-detail',
  templateUrl: 'profile-settings-faq-detail.html',
})
export class ProfileSettingsFaqDetailPage {

  subject;

  constructor(private navParams: NavParams,public navCtrl: NavController,public platform: Platform) {
    this.subject = this.navParams.data;
    if (this.subject.hasOwnProperty("qna")) {
      this.subject.qna.forEach(qna => {
        qna["isShown"] = false;
      });
    }
  }

  togglePlusButton(qna) {
    qna.isShown = !qna.isShown;
  }
  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }

}
