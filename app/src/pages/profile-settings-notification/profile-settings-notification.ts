import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { Util } from '../../global/util';


@IonicPage()
@Component({
  selector: 'page-profile-settings-notification',
  templateUrl: 'profile-settings-notification.html',
})
export class ProfileSettingsNotificationPage {

  notificationSettings = [
    {
      key: "all",
      title: "打开推送通知"
    }
  ];

  model = {};

  constructor(public navCtrl: NavController,public platform:Platform,
              public navParams: NavParams) {
  }

  onToggle(isOn, key) {
    console.log(isOn, key);
  }
  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
}
