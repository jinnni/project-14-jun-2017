import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams,  Platform} from 'ionic-angular';
import {QnaService} from "../../services/qnaService";
import {Question} from "../../data/question.interface";
import {QnaItemType} from "../../global/qnaItemType";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage({
  segment: "profile/question/:userId"
})
@Component({
  selector: 'page-profile-my-question',
  templateUrl: 'profile-my-question.html',
})
export class ProfileMyQuestionPage {

  QnaItemType = QnaItemType;
  questionList: Array<Question>;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public platform:Platform,
              public qnaService: QnaService,
              private settingsProvider:SettingsProvider) {
    const userId = navParams.get("userId");
    this.questionList = qnaService.getQuestionsListByUserId(userId);
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
