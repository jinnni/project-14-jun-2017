import {Component, ChangeDetectorRef} from '@angular/core';
import {IonicPage, NavController, NavParams, ToastController, Platform, AlertController} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {CampaignBadgeIntroPage} from "../campaign-badge-intro/campaign-badge-intro";
import {CampaignBadgeListPage} from "../campaign-badge-list/campaign-badge-list";
// import {PreSurveyCampaignPage} from "../pre-survey-campaign/pre-survey-campaign";
import {Util} from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
import { CampaignBadgeDetailPage } from '../campaign-badge-detail/campaign-badge-detail';

@IonicPage()
@Component({
  selector: 'page-campaign-list',
  templateUrl: 'campaign-list.html',
})
export class CampaignListPage {
  util = Util;
  campaigns:any;
  postSurveyQuestions:any;
  imageUrl:any;
  hide:boolean = false;
  pageNo = 0;totPg;last;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public platform:Platform,
              private toastCtrl:ToastController,
              private changeDetectorRef: ChangeDetectorRef,
              public httpService:HttpService,
              private alertCtrl: AlertController,
              private settingsProvider:SettingsProvider) {
    this.hide = false;
    this.settingsProvider.isMenuOpened = false;
    this.campaigns = [];
    this.postSurveyQuestions = [];
    this.imageUrl = localStorage.getItem("myImageUrl");
  }
  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Campaign is Paused',
      message: 'You will be notified soon!',
      buttons: [{
          text: '确定',
          handler: () => {}
        }]
    });
    alert.present();
    }
  getCampaignListByUserId(){
    this.httpService.GetCampaignListByUserIdByPage(0,30).subscribe( res => {
      this.campaigns = [];
      this.last = res.last;
      if(res.content.length > 0){
        this.hide = false;
        for (let index = res.content.length - 1; index >= 0 ; index--) {
          this.campaigns.push(res.content[index]);
        }
      }else{
        this.hide = true;
      }
      this.changeDetectorRef.detectChanges();
    },error =>{
      this.hide = false;
    });
  }
  matchDate(date,today){
    return Util.matchDate(date, today);
  }
  doInfinite(infiniteScroll){
    this.settingsProvider.campaignListResp = null;
    this.pageNo++;
    this.httpService.GetCampaignListByUserIdByPage(this.pageNo,30).subscribe(res =>{
      if(res.content.length > 0){
        this.hide = false;
        for (let index = res.content.length - 1; index >= 0 ; index--) {
          this.campaigns.push(res.content[index]); 
        }
      }else{
        this.hide = true;
      }
    },error =>{
      this.hide = false;
    });
    setTimeout(() => {
      // this.getCampaignListByUserId();
      infiniteScroll.complete();
    }, 1000);
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
  ionViewDidEnter(){
    this.getCampaignListByUserId();
  }
  ionViewWillEnter(){
    // this.getCampaignListByUserId();
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }

  seeBadges(campData:any,from) {
    if(!(campData.recordStatus == 'ACTIVE')){
      this.presentAlert();
    }else{
      this.httpService.GetAllCampaignBagde(campData.id).subscribe(resp =>{
        if(resp.length > 0){
          this.httpService.GetAllCampaignBagdeByUserId(campData.id).subscribe(res =>{
            for (let index = 0; index < resp.length; index++) {
              resp[index].gainedScore = 0;
              for (let index_ = 0; index_ < res.length; index_++) {
                if (res[index_].id == resp[index].id) {
                  resp[index].gainedScore = res[index_].answerScore;
                }
              }
            }
            let page :any;
            let badge :any;
            if(campData.type == "CAMPAIGN"){
              resp.length == 1 ? page = CampaignBadgeIntroPage : page = CampaignBadgeListPage;
            }else{
              page = CampaignBadgeDetailPage;
            }
            resp.length == 1 ? badge = resp[0] : badge = resp;
            this.navCtrl.push(page, {
              campaignName: campData.name,
              campData: campData,
              badge: badge,
              from: from
            });
          });
        }else{
          Util.showSimpleToastOnTop("目前没有任何活动的勋章哦！", this.toastCtrl);
        }
      });
    }
  }
}
