import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform, ToastController} from 'ionic-angular';
import {CampaignBadgeIntroPage} from "../campaign-badge-intro/campaign-badge-intro";
import {Util} from "../../global/util";
import {PreSurveyCampaignPage} from "../pre-survey-campaign/pre-survey-campaign";
import { HttpService } from '../../services/httpService';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-campaign-badge-list',
  templateUrl: 'campaign-badge-list.html',
})
export class CampaignBadgeListPage {
  util = Util;
  campaignName:string;
  imageUrl:string;
  from:string;
  campData:any;
  answeredChallenges:any;
  badges:any;
  constructor(public navCtrl: NavController,
              public platform:Platform,
              private httpService:HttpService,
              private settingsProvider:SettingsProvider,
              private toastCtrl:ToastController,
              public navParams: NavParams) {
    this.campaignName = navParams.get("campaignName");
    this.campData = navParams.get("campData");
    this.badges = navParams.get("badge");
    this.from = navParams.get("from");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.answeredChallenges = [];
    this.listBadge();
  }
  listBadge(){
    let sortedBadge = this.badges.sort((a:any,b:any)=>{return b.id - a.id;});
    this.badges = sortedBadge;
    for (let index = 0; index < this.badges.length; index++) {
      this.badges[index].gainedScore = this.badges[index].gainedScore;
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
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
  seeBadge(badge) {
    if(this.from == "postSurvey"){
      var today = new Date();
      today.setHours(0,0,0,0);
      if(!this.matchDate(this.campData.postSurveyDueDate,today)) {
        Util.showSimpleToastOnTop("小问答已结束！", this.toastCtrl);
      }else{
        if(!this.matchDate(this.campData.challengeDueDate,today)){
          this.httpService.GetNextPostsurveyQuestion(this.campData.id,badge.id).subscribe(res1 => {
            if(res1.surveyStatus == true && res1.completion >= 100){
              Util.showSimpleToastOnTop("此勋章里没有收官问卷", this.toastCtrl);
            }else{
              let notice = {
                clicked: true,
                campaignData: this.campData,
                from: 'post-survey',
                userId: localStorage.getItem("UserData.userId")
              };
              this.navCtrl.push(PreSurveyCampaignPage, {'noticeData':notice, badge:badge});
            }
          },err=>{
            console.log(err);
          });
        }else{
          Util.showSimpleToastOnTop("收官问卷从 "+this.campData.challengeDueDate+" 开始截止到 "+this.campData.postSurveyDueDate, this.toastCtrl);
        }
      }
    }else{
      this.navCtrl.push(CampaignBadgeIntroPage, {badge:badge,campData:this.campData});
    }
  }
  matchDate(date,today){
    return Util.matchDate(date, today);
  }
}
