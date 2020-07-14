import { Component, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, ToastController, Tab, Tabs } from 'ionic-angular';
import { UgcPage } from '../ugc/ugc';
import { NoticePage } from '../notice/notice';
import { ProfilePage } from '../profile/profile';
import { TimeLinePage } from '../timeline/timeline';
import { Events } from 'ionic-angular';
import { SettingsProvider } from '../../providers/settingsProvider';
import { HttpService } from '../../services/httpService';
import {GlobalVariable} from "../../global/global.variable";
import { SignInUpPage } from '../sign-in-up/sign-in-up';
import { UgcCreatePage } from '../ugc-create/ugc-create';
import { ProductCategoryPage } from '../product-category/product-category';
import { ProfileMyBadgePage } from '../profile-my-badge/profile-my-badge';
import { Util } from '../../global/util';
import { SignUpProfilePage } from '../sign-in-up/sign-up-profile/sign-up-profile';
import { DeliveryInfoPage } from '../delivery-info/delivery-info';
import { SignUpInterestPage } from '../sign-in-up/sign-up-interest/sign-up-interest';
import { QuickTryPage } from '../quick-try/quick-try';
import { CampaignListPage } from '../campaign-list/campaign-list';
import { StatusBar } from '@ionic-native/status-bar';
import { NotificationService } from '../../services/notificationService';
import { Platform } from 'ionic-angular/platform/platform';
import { WebIntent } from '@ionic-native/web-intent';
import { Deeplinks } from '@ionic-native/deeplinks';
declare let MediaPicker;
declare let PjPlugin:any;

let navNoticeEvent = 'navNoticeEvent';


@IonicPage({segment: 'landingPage'})
@Component({
  selector: 'page-landing',
  templateUrl: 'landing.html',
  changeDetection: ChangeDetectionStrategy.Default
})

export class LandingPage {
  @ViewChild('myTabs') tabRef: Tabs;

  showTabBar : boolean = true;
  selectedTab: number;
  badgeCount: any;
  messageCount: any;
  boxTrackCount: any;
  otherCount: any;
  public images: any = [];
  campaigns: any = [];
  public isTimelinePage = false;
  public isUgcPage = false;
  public isNoticePage = false;
  public isProfilePage = false;
  public isQuickTryPage = false;
  public isCampaignListPage = false;
  public isCUP = false;

  public  isFirstRun = true
  
  timeLinePage = TimeLinePage;
  resumeListener:any;
  ugcPage = UgcPage;
  noticePage = NoticePage;
  profilePage = ProfilePage;
  quickTryPage = QuickTryPage;
  campaignPage = CampaignListPage;
  util = Util;
  isAppBackground = true;
  isStarted = false
  notifAuthorizationStatus : Boolean
  transId = null;
  constructor(public navCtrl: NavController,
    public appCtrl: App,
    private alertCtrl: AlertController,
    public events: Events,
    public navParams: NavParams,

    private toastCtrl: ToastController,
    private statusBar: StatusBar,
    private settingsProvider: SettingsProvider,
    private notificationService: NotificationService,
    private changeDetectorRef: ChangeDetectorRef,
    private platform: Platform,
    private webIntent : WebIntent,
    private deeplinks: Deeplinks,
    private httpService: HttpService) {
      this.notificationService.registerDevcie().catch( e => {})
      this.isTimelinePage = true;
      this.isUgcPage = false;
      this.isCUP = false;
      this.isNoticePage = false;
      this.isProfilePage = false;
      this.isQuickTryPage = false;
      this.isCampaignListPage = false;
      this.settingsProvider.isMenuOpened = false;
      this.setupNotificationAuthorizationListener()
      this.selectedTab = this.getCurrentTab();
      let Alllocation = localStorage.getItem("locations");
     
      if(Alllocation == undefined || Alllocation == null){
        this.httpService.getProvinces('').subscribe(res => {
          localStorage.setItem("locations",JSON.stringify(res));
        });
      }
    }

    setupNotificationAuthorizationListener(){
      var isCordova = this.platform.is("cordova");
      var isAndroid = this.platform.is("android");
      var isIos = this.platform.is("ios");
      this.deeplinks.routeWithNavController(this.navCtrl,{}).subscribe( (res) => {
        // console.log('Successfully matched route', res);
      }, nomatch => {
        console.log("Got not match: " , nomatch)
      } )
      

      const that = this;
      this.resumeListener =   this.platform.pause.subscribe(() => {
        that.isStarted = true
        that.isAppBackground = true
        
      })
      this.resumeListener =   this.platform.resume.subscribe(() => { 
        that.isAppBackground = false
        that.isStarted = true
 
        PjPlugin.notificationAuthorizationStatus( (authorized) => {
          if(!that.notifAuthorizationStatus){
             this.notificationService.registerDevcie().catch( e => {})
             that.notifAuthorizationStatus = true
          }
         
        }, (e) => {
  
          if(that.notifAuthorizationStatus){
            this.notificationService.registerDevcie().catch( e => {})
            that.notifAuthorizationStatus = false
         }
  
        } )

       })

       if(isCordova && isAndroid){
          // Fresh Start of app
          if(!that.isStarted){
                      this.webIntent.getIntent(  ).then( (res) => {
            if(!res){
              return;
            }
            const r:any = res.extras;   
            if(r && r.notificationClicked &&  !GlobalVariable.hasNotifyHandler){
                GlobalVariable.hasNotifyHandler =   setTimeout( () => {     
                  this.events.publish(navNoticeEvent)
                }, 2000 )
              
            }
          } )

          }

        // app came from background
        this.webIntent.onIntent().subscribe( (res) => {
          // console.log('onIntent: ' , res)
            if(res && res.extras ){
              const r:any = res.extras;
              if(r.notificationClicked){
                 this.navCtrl.popToRoot();
                this.appCtrl.getRootNav().setRoot(LandingPage);
               
                setTimeout( () => {
                  console.log('Send Push')
                  that.events.publish(navNoticeEvent)
                } , 1000)

              //  that.navCtrl.popToRoot();
                
              }
            }
        } )
       }
       
       if(isCordova && isIos){
            this.notificationService.setNotificationListener(function (data) {
              if (that.isAppBackground) {
                if(that.isStarted){
                  that.navCtrl.popToRoot()
                  that.navCtrl.goToRoot({updateUrl: true})
                  setTimeout( () => {
                    console.log('Send Push')
                    that.events.publish(navNoticeEvent)
                  } , 1000);

                
                }else{
                  that.platform.ready().then( () => {
                      setTimeout( () => {
                        console.log('Send Push')
                        that.events.publish(navNoticeEvent)
                      } , 2000)
                  } );
      
                }
              }

          });
       }

  
    }  

    ionViewWillEnter(){
      this.events.subscribe(navNoticeEvent, (data) => {
        if(this.tabRef){
          this.tabRef.select(3);
        }
      });

    }
  ionViewDidLoad(){
    this.notificationService.registerDevcie().catch( e => {})
    this.isTimelinePage = true;
    this.isUgcPage = false;
    this.isCUP = false;
    this.isNoticePage = false;
    this.isProfilePage = false;
    this.isQuickTryPage = false;
    this.isCampaignListPage = false;
    this.settingsProvider.isMenuOpened = false;
    this.getPendingCampaignCount();
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
    }else{
      this.setBadge();
    }
  }
  ionViewWillLeave(){
    this.events.unsubscribe(navNoticeEvent)
  }
  async setBadge(){
    this.httpService.GetUnreadMessageCount("").subscribe(res => {
      this.settingsProvider.msgBadgeCounter = res.count;
    });
  }
  goToTab(tabNumber: number) {
    if (tabNumber == 5) {
      this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage, {from: "reg"});
    }if (tabNumber == 6) {
      this.appCtrl.getRootNavs()[0].setRoot(DeliveryInfoPage, {from: "reg"});
    }
    if (!GlobalVariable.isAuthUser && (tabNumber == 3 || tabNumber == 4 || tabNumber == 7)) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.showTabBar = false;
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage, {from: "reg"});
    } else {
      this.selectedTab = tabNumber;
      this.settingsProvider.currentTab = tabNumber;
      this.getTabPage(tabNumber);
    }
    this.changeDetectorRef.detectChanges();
  }
  totPg = 0;
  hide = true;
  getTabPage(tabNumber: number): any {
    this.isTimelinePage = false;
    this.isUgcPage = false;
    this.isCUP = false;
    this.isNoticePage = false;
    this.isProfilePage = false;
    this.isQuickTryPage = false;
    this.isCampaignListPage = false;
    this.settingsProvider.isMenuOpened = false;
    /** replaced by QTC campaign*/
    //this.settingsProvider.campaigns=[];
    // this.httpService.GetCampaignListByUserIdByPage(0,30).subscribe(res =>{
    //   this.settingsProvider.campaigns= [];
    //   if(res.content.length > 0){
    //     this.settingsProvider.campaignListResp = res;
    //     if(res.content.length > 0){
    
    //       this.totPg = res.totalPages - 1;
    //       for (let index = res.content.length - 1; index >= 0 ; index--) {
           
    //         this.settingsProvider.campaigns.push(res.content[index]); 
    //       }
    //     }else{
    //       this.totPg = res.totalPages;
    //       this.hide = true;
    //     }
    //     if(this.settingsProvider.campaigns.length > 0){
    //       this.hide = true;
    //     }else{
    //       this.hide = false;
    //     }
    //   }
    // }, (e) => {});

    switch (tabNumber) {
      case 0:
        this.httpService.isTimeLnePage = true
        if(this.settingsProvider.slider != undefined){
          if(this.settingsProvider.showSearch){
            this.settingsProvider.slider.stopAutoplay();
            this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
          }else{
            this.settingsProvider.slider.startAutoplay();
            this.settingsProvider.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
          }
        }else{
          this.httpService.toggleLoader('ugc-loader', true);   
        }
        if(this.settingsProvider.productSlider){
          this.settingsProvider.productSlider.startAutoplay();
        }
        this.isTimelinePage = true;
        break;
      case 1:
        this.isUgcPage = true;
        break;
      case 2:
        this.isCUP = true;
        this.settingsProvider.isMenuOpened = true;
        break;
      case 3:
        this.isNoticePage = true;
        break;
      case 4:
        this.isProfilePage = true;
        break;
      case 7:
        this.isQuickTryPage = true;
        break;
      case 8:
        this.isCampaignListPage = true;
      break;
    }
  }

  getPendingCampaignCount(){
    this.httpService.GetPendingCampaignCount().subscribe(res =>{
      this.settingsProvider.campBadgeCounter = res.pendingChallenges + res.pendingPostSurveys;
      this.settingsProvider.qtcBadgeCounter = res.pendingQTC;
    });
  }
  getCurrentTab(): number {
    return this.settingsProvider.currentTab;
  }
  toggleMenu() {
    this.settingsProvider.isMenuOpened = !this.settingsProvider.isMenuOpened;
    this.isCUP = this.settingsProvider.isMenuOpened;
    this.changeDetectorRef.detectChanges();
  }
  onSeeBadge() {
    if (!this.settingsProvider.isMenuOpened) return;
    this.statusBar.backgroundColorByHexString('#000000');
    this.showTabBar = false;
    this.navCtrl.push(ProfileMyBadgePage, {
      userId: this.settingsProvider.getCurrentUserId(),
      title: "我的勋章"
    });
  }
  /*Click on Create UGC button to go to Create UGC Page after picking images from Gallary*/
  showUgcCreate() {
    // console.log(this.settingsProvider.userStatus);
    if(this.settingsProvider.userStatus.ugc){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    this.showTabBar = false;
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage, {from: "reg"});
    } else {
      this.statusBar.backgroundColorByHexString('#000000');
      this.navCtrl.push(UgcCreatePage);
    }
  }

  /*Show Image Gallary to pick Images max 9*/
  //check if in use
  showImageGallary() {
    var args = {
      'selectMode': 100,
      'maxSelectCount': (9 - this.images.length),
      'maxSelectSize': 188743680,
    };
    MediaPicker.getMedias(args, (medias) => {
      for (let i = 0; i < medias.length; i++) {
        if (this.images.length < 9) {
          this.images.push(medias[i].uri);
        }
      }
      this.showTabBar = false;
      this.navCtrl.push(UgcCreatePage,{imagesArr:this.images});
      this.images = [];
    });
  }
    //check if in use

  onWriteReview() {
    if (!this.settingsProvider.isMenuOpened) return;
    this.showTabBar = false;
    this.statusBar.backgroundColorByHexString('#000000');
    this.navCtrl.push(ProductCategoryPage);
  }
}
