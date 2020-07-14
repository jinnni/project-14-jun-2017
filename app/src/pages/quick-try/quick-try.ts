import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { HttpService } from '../../services/httpService';
import { ProductDetailPage } from '../product-detail/product-detail';
import { PreSurveyCampaignPage } from '../pre-survey-campaign/pre-survey-campaign';
import { SettingsProvider } from '../../providers/settingsProvider';
import { DatePipe } from '@angular/common';
import { DeliveryInfoPage } from '../delivery-info/delivery-info';
import { ProfilePublicPage } from '../profile-public/profile-public';
var moment = require('moment');

@IonicPage()
@Component({
  selector: 'page-quick-try',
  templateUrl: 'quick-try.html',
})
export class QuickTryPage {
  @ViewChild('overlayWinner') overlayWinner: HTMLDivElement;
  selectTab = 0;
  evenList = [];
  oddList = [];
  evenListGM = [];
  oddListGM = [];
  appliedCampaign = [];
  winnerList = [];
  pageNo = 0;
  pageNo1 = 0;
  pageNo2 = 0;
  hide1 = false;
  hide2 = false;
  hide3 = false;
  imageUrl = "";
  showOverlay = false;
  lastPage0 = false;
  lastPage1 = false;
  lastPage2 = false;
  datePipe  = new DatePipe("en-US");
  tim = moment().format();
  tim1 = new Date();
  balancePoints = 0;
  pageTabs:any = "tab1";
  winner:any;
  winnerLastPage = false;
  winnerPage = 0;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private changeDetectorRef: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private httpService: HttpService,
    private settingsProvider:SettingsProvider) {
      this.imageUrl = localStorage.getItem("myImageUrl");
      this.selectTab = 0;
  }
  ionViewDidEnter(){
    this.pageTabs = "tab1";
    this.selectedTab(0);
  }
  getAvailableQTCCampaign(){
    this.httpService.GetAvailableQTCCampaignByUserId(0).subscribe(res =>{
      this.evenList= [];
      this.oddList= [];
      this.lastPage0 = res.last;
      if(res.content.length > 0){
        for (let index = 0; index < res.content.length; index++) {
          // this.balancePoints = res.content[0].coinBalance;
          this.applyDateDiffData(res.content[index]);
          if(index%2 == 0){
            this.evenList.push(res.content[index]);
          }else{
            this.oddList.push(res.content[index]);
          }
        }
      }else{
        this.hide1 = true;
      }
      this.changeDetectorRef.detectChanges();
    },error => {
      this.hide1 = true;
    });
  }
  getBalanceCoins(){
    this.httpService.GetBalanceCoins().subscribe(res =>{
      this.balancePoints = res.coinBalance;
    },error => {
      console.log(error);
    });
  }
  getGiftMarketProducts(){
    this.httpService.GetGiftMarketProducts(0,"","in-stock").subscribe(res =>{
      this.evenListGM= [];
      this.oddListGM= [];
      this.lastPage2 = res.last;
      if(res.content.length > 0){
        for (let index = 0; index < res.content.length; index++) {
          if(index%2 == 0){
            this.evenListGM.push(res.content[index]);
          }else{
            this.oddListGM.push(res.content[index]);
          }
        }
      }else{
        this.hide3 = true;
      }
      this.changeDetectorRef.detectChanges();
    },error => {
      this.hide3 = true;
    });
  }
  getAppliedQTCCampaign(){
    this.httpService.GetAppliedQTCCampaignByUserId(0).subscribe(res =>{
      this.appliedCampaign= [];
      this.lastPage1 = res.last;
      if(res.content.length > 0){
        for (let index = 0; index < res.content.length; index++) {
          res.content[index].showWinner = false;
          this.appliedCampaign.push(res.content[index]);
        }
      }else{
        this.hide2 = true;
      }
      this.changeDetectorRef.detectChanges();
    },error => {
      this.hide2 = true;
    });
  }
  applyDateDiffData(data:any){
    let interval = 1000;
    let x = new Date(data.preSurveyDueDate);
    let preSurveyDueDate = new Date(x.getTime() - x.getTimezoneOffset() * 119876);
    // let preSurveyDueDate = new Date(data.preSurveyDueDate);
    let d = new Date(); 
    let now = new Date(d.getTime());
    // let now = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    let str1 = preSurveyDueDate.getMonth()+'/'+preSurveyDueDate.getDate()+'/'+preSurveyDueDate.getFullYear();
    let str2 = now.getMonth()+'/'+now.getDate()+'/'+now.getFullYear();
    var m1 = moment(preSurveyDueDate,'MM/DD/YYYY HH:MM:SS');
    var m2 = moment(now,'MM/DD/YYYY HH:MM:SS');
    let timeDiff = m1.diff(m2);
    let daysDiff = m1.diff(m2, 'days');
    let duration = moment.duration(timeDiff - interval, 'milliseconds');
    data.days = daysDiff;
    data.hours = duration.hours();
    data.mins = duration.minutes();
    data.secs = duration.seconds();
    setInterval(function(){
      duration = moment.duration(duration - interval, 'milliseconds');
      data.days = daysDiff;
      data.hours = duration.hours();
      data.mins = duration.minutes();
      data.secs = duration.seconds();
    }, interval);
  }
  ionViewWillLeave() {
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
  }
  selectedTab(index:number)
  {
    this.selectTab  = index;
    switch (this.selectTab) {
      case 0:
        this.pageNo = 0;
        this.evenList = [];
        this.oddList = [];
        this.getAvailableQTCCampaign();
        break;
      case 1:
        this.pageNo1 = 0;
        this.appliedCampaign = [];
        this.winnerList = [];
        this.getAppliedQTCCampaign();
        break;
      case 2:
        this.pageNo2 = 0;
        this.evenListGM = [];
        this.oddListGM = [];
        new Promise ((res,rej) => {
          res();
        }).then(() => {
          this.getBalanceCoins();
        }).then(() => {
          this.getGiftMarketProducts();
        }).catch((error) => {
          console.log(error);
        });
        break;
      default:
        break;
    }
  }
  doInfinite0(infiniteScroll){
    this.pageNo++;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.httpService.GetAvailableQTCCampaignByUserId(this.pageNo).subscribe(res =>{
        this.lastPage0 = res.last;
        if(res.content.length > 0){
          for (let index = 0; index < res.content.length; index++) {
            res.content[index].disableButton = false;
            this.applyDateDiffData(res.content[index]);
            if(index%2 == 0){
              this.evenList.push(res.content[index]);
            }else{
              this.oddList.push(res.content[index]);
            }
          }
        }
      });
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 1000);
  }
  doInfinite1(infiniteScroll){
    this.pageNo1++;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.httpService.GetAppliedQTCCampaignByUserId(this.pageNo1).subscribe(res =>{
        this.lastPage1 = res.last;
        let temp = this.appliedCampaign;
        if(res.content.length > 0){
          for (let index = 0; index < res.content.length; index++) {
            res.content[index].showWinner = false;
            temp.push(res.content[index]);
          }
        }
      });
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 1000);
  }
  doInfinite2(infiniteScroll){
    this.pageNo2++;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.httpService.GetGiftMarketProducts(this.pageNo2,"","in-stock").subscribe(res =>{
        this.lastPage2 = res.last;
        if(res.content.length > 0){
          for (let index = 0; index < res.content.length; index++) {
            if(index%2 == 0){
              this.evenListGM.push(res.content[index]);
            }else{
              this.oddListGM.push(res.content[index]);
            }
          }
        }
      });
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 1000);
  }
  productDetail(item){
    this.navCtrl.push(ProductDetailPage, {item:item});
    // this.httpService.GetProductByID(item.id).subscribe(res => {
    //   this.navCtrl.push(ProductDetailPage, {item:res});
    // },eer=>{
    //   console.log(eer);
    // });
    
  }
  surveyPage(item){
    item.disableButton = true;
    this.httpService.GetQTCCampaignStatusByCmpId(item.id).subscribe(res => {
      if(res.ended){
        let alert = this.alertCtrl.create({
        // title: 'Campaign ended!',
        message: '此活动已结束了！',
        cssClass: 'okcancel',
        buttons: [{
            text: '确定',
            handler: () => {
              this.ionViewDidEnter();
            }
          }]
        });
        alert.present();
      }else{
        if(item.campaignMember[0].address){
          if(item.campaignMember[0].address != ""){
            let alert = this.alertCtrl.create({
              // title: 'Campaign ended!',
              message: '你已经提交一次申请了哦，请不要着急，活动结束后我们会立即通知你哒。',
              cssClass: 'okcancel',
              buttons: [{
                  text: '确定',
                  handler: () => {
                    this.ionViewDidEnter();
                  }
                }]
            });
            alert.present();
          }else{
            let notice = {
              clicked: true,
              campaignData: {},
              from: 'quick-try-free',
              userId: localStorage.getItem("UserData.userId")
            };
            this.httpService.GetCampaignByUserId(item.id).subscribe(res => {
              notice.campaignData = res;
              this.navCtrl.push(PreSurveyCampaignPage, {'noticeData':notice}).then(()=>{
                item.disableButton = false;
              });
            });
          }
        }else{
          let notice = {
            clicked: true,
            campaignData: {},
            from: 'quick-try-free',
            userId: localStorage.getItem("UserData.userId")
          };
          this.httpService.GetCampaignByUserId(item.id).subscribe(res => {
            notice.campaignData = res;
            this.navCtrl.push(PreSurveyCampaignPage, {'noticeData':notice}).then(()=>{
              item.disableButton = false;
            });
          });
        }
      }
    },error =>{
      console.log(error);
    });
  }
  claimGift(item){
    if(this.balancePoints >= item.coinCost){
      this.navCtrl.push(DeliveryInfoPage,{campId:item.id,from:'quick-try',giftPoint:item.coinCost,userPoint:this.balancePoints});
    }else{
      let alert = this.alertCtrl.create({
        // title: 'Sorry',
        message: '很抱歉，你的积分暂时不足 - 你可以通过申请参加更多的闪闪宝活动来赚取积分哦。加油加油哈！',
        cssClass: 'okcancel',
        buttons: [{
            text: '确定',
            handler: () => {}
          }]
      });
      alert.present();
    }
  }
  toggleWinnerBox(item){
    this.showOverlay = !this.showOverlay;
    this.winnerPage = 0;
    this.winnerList = [];
    this.winner = item;
    this.changeDetectorRef.detectChanges();
    this.showMoreWinners();
  }
  showMoreWinners(){
    this.httpService.GetQTCWinners(this.winner.id,this.winnerPage).subscribe(res1 => {
      this.winnerLastPage = res1.last;
      if(res1.totalElements > 0){
        this.winner.showWinner = !this.winner.showWinner;
        for (let index = 0; index < res1["content"].length; index++) {
          res1["content"][index].showWinner = false;
          this.winnerList.push(res1["content"][index]);
        }
        if(!this.winnerLastPage){
          this.winnerPage++;
        }
      }
      this.changeDetectorRef.detectChanges();
    },eer=>{
      console.log(eer);
    });
  }
  goToProfile(user){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      // if(this.publicUserId == this.userData.id){
      //   this.navCtrl.pop();
      // }else{
        this.navCtrl.push(ProfilePublicPage, {userData: user});
      // }
    }
  }
  getCountStyle(count:any,exceptionCount)
  {
    if(exceptionCount > 0){
      if(Number(count) < 1000000){
        return count;
      }
    }
    if(Number(count)<1000){
      return count;
    }
    if(Number(count)<100000){
      let countText = (Number(count)/1000 | 0) + 'k';
      return countText;
    }
    else{
      let countText = (Number(count)/1000000).toString();
      if(countText.indexOf('.') !== -1)
      {
        countText = countText.substr(0, countText.indexOf('.')+2) + 'M';
      } else {
        countText = countText.length > 3 ? countText.substring(0,3) : countText + 'M';
      }
      return countText;
    }
  }
  showHowToPlayQTCMessage(){
    let alert = this.alertCtrl.create({
      title: '如何玩转闪闪宝？',
      message: '\n 1-通过回答几个小问答，就可以申请赢取并获得免费产品。\n\n 2-填写问卷时请务必确保您同意我们的条款和条件，这样我们才能确认您有资格赢取产品。\n\n 3-在同意条款后，请确保您的收件地址无误并有效。提交地址之后是无法进行再次修改的。\n\n 4-在申请期结束之后，评价达人管理系统将会随机抽选幸运达人。为了增加您获胜的机率，请关联您的多个社交平台账号，用邀请码邀请你的好友加入评价达人社区成为一员。\n\n 5-"在收到您的产品后，请进入 宝BOX" 页面，完成几项任务并解锁勋章。这样才能增加您从评价达人赢得更多产品的机会。\n\n 6-那些没有被抽中的申请者，仍然有机会赢得免费产品。若没有被抽取，你即将会收获积分，然后可以在评价达人宝屋（积分商城）内使用积分换取产品。因此，在评价达人社区，每位用户都是赢家。',
      cssClass: 'okcancel pre-line',
      buttons: [{
          text: '确定',
          handler: () => {}
        }]
    });
    alert.present();
  }
}
