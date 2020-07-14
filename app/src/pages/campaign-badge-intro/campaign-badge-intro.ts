import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform, ToastController} from 'ionic-angular';
import {Util} from "../../global/util";
import {CampaignBadgeDetailPage} from "../campaign-badge-detail/campaign-badge-detail";
import {CustomHtmlPage} from "../custom-html/custom-html";
import {PreSurveyCampaignPage} from "../pre-survey-campaign/pre-survey-campaign";
import { HttpService } from '../../services/httpService';
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage()
@Component({
  selector: 'page-campaign-badge-intro',
  templateUrl: 'campaign-badge-intro.html',
})
export class CampaignBadgeIntroPage {

  util = Util;
  campData:any;
  campaignName:string;
  badge:any;
  imageName:string;
  from:string;
  imageUrl:string;
  answeredChallenges:any;
  gainedScore;
  constructor(public navCtrl: NavController,
              public platform: Platform,
              private settingsProvider:SettingsProvider,
              private httpService:HttpService,
              private toastCtrl:ToastController,
              public navParams: NavParams) {
    
    this.campData = navParams.get("campData");
    this.answeredChallenges = navParams.get("answeredChallenges");
    this.badge = navParams.get("badge");
    this.gainedScore = this.badge.gainedScore;
    if(this.gainedScore == undefined){
      this.gainedScore = 0;
    }
    this.from = navParams.get("from");
    this.campaignName = navParams.get("campaignName");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.answeredChallenges = [];
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
  converted(terms,element){
    var pushHtml = document.querySelector(element);
    pushHtml.innerHTML = terms;
  }
  unlockBadge() {
    if(this.from == "postSurvey"){
      let today = new Date();
      today.setHours(0,0,0,0);
      console.log("aa");
      
        if(!this.matchDate(this.campData.postSurveyDueDate,today)) {
          Util.showSimpleToastOnTop("小问答已结束！", this.toastCtrl);
        }else{
          if(!this.matchDate(this.campData.challengeDueDate,today)){
            this.httpService.GetNextPostsurveyQuestion(this.campData.id,this.badge.id).subscribe(res1 => {
              if(res1.surveyStatus == true && res1.completion >= 100){
                Util.showSimpleToastOnTop("此勋章里没有收官问卷", this.toastCtrl);
              }else{
                let notice = {
                  clicked: true,
                  campaignData: this.campData,
                  from: 'post-survey',
                  userId: localStorage.getItem("UserData.userId"),
                  postSurveyQuestion:res1
                };
                // this.navCtrl.push(PreSurveyCampaignPage,{campData:this.campData, from: 'post-survey',postSurveyQuestion:res1,badge:this.badge});
                this.navCtrl.push(PreSurveyCampaignPage,{'noticeData':notice, badge:this.badge});
              }
            },err=>{
              console.log(err);
            });
          }else{
            Util.showSimpleToastOnTop("收官问卷从 "+this.campData.challengeDueDate+" 开始截止到 "+this.campData.postSurveyDueDate, this.toastCtrl);
          }
      }
    }else{
      this.navCtrl.push(CampaignBadgeDetailPage, {badge:this.badge,campData:this.campData,answeredChallenges:this.answeredChallenges,score:this.gainedScore}).then(()=>{
        let currentIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(currentIndex);
      });
    }
  }
  matchDate(date,today){
    return Util.matchDate(date, today);
  }
  seeKnowMore() {
    this.navCtrl.push(CustomHtmlPage, {
      title: "知道更多",
      content: this.badge.content,
      description: this.badge.description,
      from: "intro",
    });
  }
}
