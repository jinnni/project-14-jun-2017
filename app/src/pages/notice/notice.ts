import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {NoticeListPage} from "../notice-list/notice-list";
import {IonicPage, Platform, ToastController, AlertController, ModalController, NavController, Content} from "ionic-angular";
import {HttpService} from "../../services/httpService";
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import {Util} from "../../global/util";
import {GlobalVariable} from "../../global/global.variable";
import { PreSurveyCampaignPage } from '../../pages/pre-survey-campaign/pre-survey-campaign';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage({
  segment: "notice"
})
@Component({
  selector: 'page-notice',
  templateUrl: 'notice.html',
})
export class NoticePage {
  isLast=false;
  noticeListPage = NoticeListPage;
  counter:number = 0;
  isGuestUser:boolean;
  messageCount:any;
  boxTrackCount:any;
  otherCount:any;
  badgeCount:any;
  pageno = 0;
  totPg;
  notices: any;
  note:any;
  userData:any;
  campaignMember = [];
  campData :any;
  hide=true;
  @ViewChild(Content) content: Content;
  constructor(
    private navCtrl: NavController,
    private httpService:HttpService,
    public toastCtrl:ToastController,
    public platform:Platform,
    private changeDetectorRef: ChangeDetectorRef,
    private alertCtrl: AlertController,
    private settingsProvider: SettingsProvider,
    public modalCtrl: ModalController,
    private nativePageTransitions: NativePageTransitions){
    this.userData =JSON.parse(localStorage.getItem("UserData"));
  }
  ionViewDidEnter(){
    // this.setBadge();
    this.loadMessage();
  }
  doNoticeRefresh(refresher) {
    this.loadMessage();
    setTimeout(() => {
      refresher.complete();
    }, 1000);
  }
  scrollHandler(event) {
    // console.log(event.scrollTop );
    
    // if(event.scrollTop == 500 && this.pageno <= this.totPg){
    // this.doInfinite();
    // }
    // this.content.scrollToBottom(this.content._scrollContent.nativeElement.scrollHeight);

  }
  converted(terms,element){
    var pushHtml = document.querySelector(element);
    pushHtml.innerHTML = terms;
  }
  
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.registerBackButton(this.platform,this.counter,this.toastCtrl);
  }
  async setBadge(){
    this.httpService.GetUnreadMessageCount("").subscribe(res => {
      this.settingsProvider.msgBadgeCounter = res.count;
    });
  }
  deleteMessage(item){
    let alert;
    let buttons = [];
    var __this = this;
    buttons.push({
      text: '确定',
      cssClass: '',
      handler: () => {
        item.hide = true;
        alert.dismiss();
        this.httpService.DeleteMessageById(item.id).subscribe(res =>{});
      }
    })
      buttons.push({
        text: '取消',
        role: 'cancel',
        cssClass: '',
        handler: () => {
          alert.dismiss();
        }
      })
    alert = this.alertCtrl.create({
      title: '删除信息',
      message: '确定你要删除此条信息',
      buttons: buttons,
      enableBackdropDismiss: false,
      cssClass: 'okcancel'
    });
    alert.present();
  }

  loadMessage(){
    this.pageno = 0;
    this.httpService.GetUserMessage("none",10,this.pageno).subscribe(res => {
      this.notices = [];
      this.note=[];
      this.isLast = res.last;
      if(res.content.length > 0){
        this.hide = true;
        this.totPg = res.totalPages - 1;
      }else{
        this.totPg = res.totalPages;
      }
      for (let index = 0; index < res.content.length; index++) {
        res.content[index].clicked = false;
        if(res.content[index].category == "pre_survey"){
          res.content[index].buttonText = "马上申请";
        }
        this.note.push(res.content[index]);
      }
      this.notices = this.note;
      if(this.notices == 0){
        this.hide = false;
      }
      for (let item of this.notices) {
        if (item.status == "new" || item.status == "unread") {
          this.httpService.ChangeMessageStatus("", "read", item.id).subscribe(res => {
            this.setBadge();
          });
        }
      }
      setInterval(() => {
        this.httpService.GetNewMessageCount("","new").subscribe(res1 => {
          for (let index = 0; index < res1.length; index++) {
            if(res1[index].status == "new"){
              this.notices.push(res1[index]);
            }
          }
          this.changeDetectorRef.detectChanges();
        });
      }, 480000);
    }, err =>{
      this.totPg = 0;
      this.hide = false;
    });
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
   let options: NativeTransitionOptions = {
      direction: 'up',
      duration: 100,
      slowdownfactor: 1,
      slidePixels: 200,
      iosdelay: 100,
      androiddelay: 100,
      fixedPixelsTop: 0,
      fixedPixelsBottom: 0
    };
    this.nativePageTransitions.fade(options);
  }
  
  matchDate(date,dateToCompare){
    return Util.matchDate(date, dateToCompare);
  }
  openNotice(notice) {
    notice.clicked = true;
    this.httpService.GetCampaignByUserId(notice.data).subscribe(res => {
      // notice.campaignMember = res.campaignMember;
      notice.campaignData = res;
      // notice.preSurveyDueDate = res.preSurveyDueDate;
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      notice.from = 'pre-survey';
      if (!this.matchDate(res.preSurveyDueDate,today)) {
        Util.showSimpleToastOnTop("小问答已结束！",this.toastCtrl);
      } else {
        this.navCtrl.push(PreSurveyCampaignPage, {'noticeData':notice});
        
        // this.httpService.GetNextPresurveyQuestion(notice.data,'pre-survey').subscribe(res1 => {
        //   notice.clicked = false;
        //   this.navCtrl.push(PreSurveyCampaignPage, {campData: notice.campData, from: 'pre-survey',preSurveyQuestion:res1,'item':notice});
        // },eer=>{
        //   console.log(eer);
        // });
      }
    },eer=>{
      Util.showSimpleToastOnTop("已申请 / 此内容不存在",this.toastCtrl);
    });
  }
  doInfinite(infiniteScroll){
    this.pageno++;
    this.httpService.GetUserMessage("none",10,this.pageno).subscribe(res => {
      this.notices = [];
      this.isLast = res.last;
      for (let index = 0; index < res.content.length; index++) {
        if(res.content[index].category == "pre_survey"){
          res.content[index].buttonText = "马上申请";
        }
        this.note.push(res.content[index]);
      }
      this.notices = this.note;
      this.changeDetectorRef.detectChanges();
      for (let item of this.notices) {
        if (item.status == "new" || item.status == "unread") {
          this.httpService.ChangeMessageStatus("", "read", item.id).subscribe(res => {
            this.setBadge();
          });
        }
      }
    });
    infiniteScroll.complete();
  }
  alertAlreadyCompleted() {
    let alert = this.alertCtrl.create({
      title: '恭喜恭喜，已完成启动！',
      message: '如最终被选的话你即将还会收到通知，感谢您的配合！',
      buttons: [
        {
          text: '确认',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }
}
