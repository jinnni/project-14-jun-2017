import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform, AlertController} from 'ionic-angular';
import {CustomHtmlPage} from "../custom-html/custom-html";
import {HttpService} from "../../services/httpService";
import { Util }  from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-campaign-badge-detail',
  templateUrl: 'campaign-badge-detail.html',
})
export class CampaignBadgeDetailPage {
  customHtmlPage = CustomHtmlPage;
  lastSelectedChallenge: number;
  pageNo:number = 0;
  campData : any;
  badge : any;
  badgeChallenges : any;
  gainedScore:number = 0;
  imageUrl:string;
  userId;answeredChallenges:any;
  openPopup=false;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              private settingsProvider:SettingsProvider,
              private alertCtrl: AlertController,
              public httpService:HttpService) {
    this.httpService.toggleLoader("ugc-loader",true);
    this.badgeChallenges = [];
    this.userId = localStorage.getItem("UserData.userId");
    if(navParams.get("campData") == undefined){
        this.campData = JSON.parse(localStorage.getItem("campDataTemp"));
        this.badge = JSON.parse(localStorage.getItem("badgeTemp"));
    }else{
      this.campData = navParams.get("campData");
      localStorage.setItem("campDataTemp",JSON.stringify(this.campData));
      this.badge = navParams.get("badge");
      localStorage.setItem("badgeTemp",JSON.stringify(this.badge));
    }
    this.answeredChallenges = navParams.get("answeredChallenges");
    this.imageUrl = localStorage.getItem("myImageUrl");
  }
  ionViewDidLoad(){
    // Util.unRegisterBackButton(this.platform,this.navCtrl);
    this.getBadgeById();
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
    for (let index = 0; index < this.badgeChallenges.length; index++) {
      this.badgeChallenges[index].isSelected = false;
    }
  }
  getBadgeById(){
    this.badgeChallenges = [];
    this.httpService.GetAllChallengesByBadgeId(this.badge.id).subscribe(resp =>{
      if(resp.length > 0){
        this.gainedScore = 0;
        this.httpService.GetAnsweredChallengeByBadgeId(this.badge.id).subscribe(res =>{
          for (const item of resp) {
            item.badgeChallengeStatus = "pending";
            item.isSelected = false;
            item.comment = "";
            if(res.length > 0){
              for(let item_ of res[0].challenges){
                if(item.id == item_.challengeId){
                  item.attempted = true;
                  if(item_.approvedStatus == "approved"){
                    this.gainedScore += item_.point;
                  }
                  if(item_.approvedStatus == "approved" || item_.approvedStatus == "rejected"){
                    item.badgeChallengeStatus = item_.approvedStatus;
                    item.comment = item_.comment;
                  }else{
                    item.badgeChallengeStatus = "hold";
                  }
                }
              }
            }
            this.badgeChallenges.push(item);
          }
          this.httpService.getAllImagesWithClassname("ugc-loader","");
        });
      }
      else{
        this.httpService.getAllImagesWithClassname("ugc-loader","");
      }
    });
  }
  onClickChallenge(challengeId: number) {
    // if it's the same one clicked
    if (this.lastSelectedChallenge == challengeId) {
      // cancel it and do nothing
      this.cancelSelection(this.lastSelectedChallenge);
      this.lastSelectedChallenge = null;
      return;
    }
    // cancel the last selected challenge if there is one
    if (!!this.lastSelectedChallenge) {
      this.cancelSelection(this.lastSelectedChallenge);
    }
    // select current challenge
    const challenge = this.badgeChallenges.find(challenge => {
      return challenge.id == challengeId;
    });
    challenge.isSelected = true;
    this.lastSelectedChallenge = challengeId;
  }
  cancelSelection(challengeId: number) {
    const challenge = this.badgeChallenges.find(challenge => {
      return challenge.id == challengeId;
    });
    challenge.isSelected = false;
  }
  converted(terms,element){
    var pushHtml = document.querySelector(element);
    pushHtml.innerHTML = terms;
  }
}
