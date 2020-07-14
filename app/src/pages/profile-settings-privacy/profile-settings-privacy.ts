import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { Util } from "../../global/util";
@IonicPage()
@Component({
  selector: 'page-profile-settings-privacy',
  templateUrl: 'profile-settings-privacy.html',
})
export class ProfileSettingsPrivacyPage {

  privacySettings = [
    {
      key: "location",
      title: "显示我当前位置"
    },
    {
      key: "age",
      title: "显示我的年龄"
    }
  ];

  model = {};

  constructor(public navCtrl: NavController,
              public platform: Platform,
              public navParams: NavParams) {
  }

  onToggle(isOn, key) {
    console.log(isOn, key);
  }
  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
}
