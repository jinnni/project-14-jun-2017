import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage()
@Component({
  selector: 'page-custom-html',
  templateUrl: 'custom-html.html',
})
export class CustomHtmlPage {
  title: string;
  from: string;
  imageUrl: string;
  badge: any;
  content: string;
  description: string;

  constructor(public navCtrl: NavController,
              public platfrom:Platform,
              public navParams: NavParams,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.title = this.navParams.get("title");
    this.badge = this.navParams.get("badge");
    this.content = this.navParams.get("content");
    this.description = this.navParams.get("description");
    this.from = this.navParams.get("from");
    this.imageUrl = localStorage.getItem("myImageUrl");
  }
  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platfrom,this.navCtrl)
  }
}
