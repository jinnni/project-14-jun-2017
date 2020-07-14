import { Component } from '@angular/core';
import { IonicPage, NavParams, Platform, NavController} from 'ionic-angular';
import {Answer} from "../../data/answer.interface";
import {QnaItemType} from "../../global/qnaItemType";
import {QnaService} from "../../services/qnaService";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage({
  segment: "profile/answer/:userId"
})
@Component({
  selector: 'page-profile-my-answer',
  templateUrl: 'profile-my-answer.html',
})
export class ProfileMyAnswerPage {

  QnaItemType = QnaItemType;
  answerList: Array<Answer>;

  constructor(public navParams: NavParams,
              public navCtrl: NavController,
              public platform:Platform,
              public qnaService: QnaService,
              private settingsProvider:SettingsProvider) {
    const userId = navParams.get("userId");
    this.answerList = qnaService.getAnswerListByUserId(userId);
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      this.settingsProvider.productSlider.startAutoplay(); 
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.productSlider.stopAutoplay();
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
          this.settingsProvider.productSlider.startAutoplay();
          this.settingsProvider.slider.startAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
        }
      }else{
        this.settingsProvider.productSlider.stopAutoplay();
        this.settingsProvider.slider.stopAutoplay();
        if(this.platform.is("ios")){
          this.settingsProvider.statusBar.styleDefault();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
        }else{
          this.settingsProvider.statusBar.styleLightContent();
          this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
        }
      }
    }
  }
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
}
