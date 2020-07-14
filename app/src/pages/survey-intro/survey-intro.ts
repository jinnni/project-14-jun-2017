import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import surveys from "../../data/surveys";
import {SurveyPage} from "../survey/survey";
import {Survey as ISurvey} from "../../data/survey.interface";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage({
  segment: "survey/:id"
})
@Component({
  selector: 'page-survey-intro',
  templateUrl: 'survey-intro.html',
})
export class SurveyIntroPage {

  surveys = surveys;
  surveyData: ISurvey;

  constructor(private navCtrl: NavController,private platform:Platform,public navParams: NavParams,
    private settingsProvider: SettingsProvider) {
    const surveyId = navParams.get("id");
    this.surveyData = this.surveys.find(survey => {
      return survey.id == surveyId;
    });

    if (!this.surveyData) {
      throw new Error("no survey on given id");
    }
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
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }

  startSurvey() {
    this.navCtrl.push(SurveyPage,{type:"intro"});
  }
}
