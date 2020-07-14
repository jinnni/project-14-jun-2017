import {Component,ViewChild, ChangeDetectorRef} from '@angular/core';
import {AlertController, LoadingController, NavController, ToastController, NavParams, Platform, Content, App} from 'ionic-angular';
import { LandingPage } from '../landing/landing';
import {GlobalVariable} from "../../global/global.variable";
import {Http} from "@angular/http";
import {HttpService} from "../../services/httpService";
import { Clipboard } from '@ionic-native/clipboard';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {KnowMorePage} from "../know-more/know-more";
import {Storage} from "@ionic/storage";
import { SettingsProvider } from '../../providers/settingsProvider';
import { File } from '@ionic-native/file';
import {Util} from "../../global/util";
declare let MediaPicker;
declare let WeiboSDK: any;

@Component({
  selector: 'page-profile-social-impact',
  templateUrl: 'profile-social-impact.html'
})
export class ProfileSocialImpactPage {
  
  private win: any = window;
  isOpen = false;
  isSignUp: boolean;
  userData: any;
  userDataStorage: any;
  imageURI: any;
  imageUrl: any;
  socialProfilePic: any;
  snsServiceList: any = [];
  socialImpactList: any = [];
  imageContents: any = [];
  totalFanCount: number;
  socialImpactLevel: number;
  socialImpactScore: number = 0;
  referralInfo: any;
  public unregisterBackButtonAction: any;
  toggleID = -1;
  login_type = null;
  loader: any;
  @ViewChild(Content) content: Content;
  constructor(private navCtrl: NavController,
              public appCtrl: App,
              public navParams: NavParams,
              private toastCtrl: ToastController,
              public  http: Http,
              public file: File,
              private clipboard: Clipboard,
              private transfer: FileTransfer,
              private httpService: HttpService,
              public platform: Platform,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private settingsProvider:SettingsProvider,
              private cd: ChangeDetectorRef) {
    this.settingsProvider.isMenuOpened = false;
    this.isSignUp = this.navParams.get('isSignUp');
    this.userData = this.navParams.get('userData');
    console.log("userdata",this.userData);

    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆',
      duration: 4000
    });
    this.loader.present();
    this.loadConfig()
      .then(() => this.tryToAutoConnectWeibo())
      .then(() => {
        console.log("Dismissing general loader");
        this.loader.dismiss()
      })
   
  }

  tryToAutoConnectWeibo(): any {
    console.log("Trying to Auto connect weibo");
    return new Promise((resolve, reject) => {
      var item = this.snsServiceList.find((element) => element.id === 1);
      if(this.userComesFromWeiboLogin() || this.userHasWeiboInstalled()){
        console.log("User comes from weibo login. Creating or updating social impact record");
        return this.automaticUpdateSocialImpactWeibo(item);
      } else {
        console.log("User won't auto connect weibo");
        reject(false);
      }
    });
  }
  userHasWeiboInstalled() {
    console.log("User has weibo installed?", this.httpService.weiboSDKInstalledIos);
    return this.httpService.weiboSDKInstalledIos;
  }

  automaticUpdateSocialImpactWeibo(item: any):Promise<any> {
    console.log("Automatically updating social impact", item);
    console.log("I'm going to link WEIBO");
    return this.linkWeibo(item);
  }
  hasApprovedWeiboSocialImpact(socialImpactList: any) {
    let elem = socialImpactList.find((element) => element.snsServiceId === 1 && element.snsStatus === 'APPROVED');
    return elem
  }

  loadConfig() {
    
    this.userDataStorage = localStorage.getItem("userData");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    console.log("Inside loadConfig",this.socialProfilePic);

    return new Promise((resolve, reject) => {
      this.getReferralInfo()
      .then(() => this.getSnsServiceList())
      .then(() => this.getSocialImpactByUserId() )
      .then(() => {
        this.socialImpactLevel = this.getSocialImpactLevel(this.socialImpactScore);
        resolve(true);
      }).catch(e => {
        this.presentToast("糟糕，出错了");
        console.error( "loadConfig Error: " + JSON.stringify(e))
        reject(false);
      });
    });
  }

  ionViewDidLoad() {
    this.initializeBackButtonCustomHandler();
    this.login_type = localStorage.getItem('login_type') || null;
  }

  ionViewWillEnter(){
    if(this.settingsProvider.slider != null){
      this.settingsProvider.slider.stopAutoplay();
      if(this.platform.is("ios")){
        this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
      }else{
        this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
      }
    }
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
  }

  ionViewWillLeave() {
    if(this.settingsProvider.slider != null){
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
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
      console.log('Prevent Back Button Page Change');
    }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  }

  skip() {
    this.appCtrl.getRootNavs()[0].setRoot(LandingPage);
  }

  getSocialImpactLevel(totalFanCount: number) {
    if (totalFanCount >= 20000) {
      return 4;
    }
    if (totalFanCount >= 5000) {
      return 3;
    }
    if (totalFanCount >= 1000) {
      return 2;
    }
    if (totalFanCount > 0) {
      return 1;
    }
    return 0;
  }

  getSnsServiceList() {
    return new Promise((resolve, reject) => {
      console.log("Inside getSnsServiceList");
      this.httpService.GetSnsServiceList().subscribe(res => {
        this.snsServiceList = res;
        console.log("subscribe snsServiceList", this.snsServiceList)
        resolve(true);
      }, (e) => {
        reject(e)
        console.error("getSnsServiceList Error: " + JSON.stringify(e))
      });
    });
    
  }

  orderBy(name = "rank") {
    return this.snsServiceList.sort((a, b) => a.rank - b.rank) || null;
  }

  /**
   * Merges data from snsServiceList and SocialImpactList
   */
  mergeSnsWithSocialImpact() {
    return new Promise<any>((resolve, reject) => {
      //(APPROVED, HOLD, PENDING, REJECTED)
      console.log("Inside mergeAllData");
      this.snsServiceList.map((item, index) => {
        let data = this.socialImpactList.find(data => {
          return data.snsServiceId === item.id;
        });

        if(data) {
          console.log("Found data, setting status");
          item.status = data.snsStatus;
          item.socialImpactId = data.id;
          item.isSubmitted = true;
          item.followerCount = data.followerCount;
          item.snsUserUrl = data.snsUserUrl;
          if(item.id === 1 && !item.status) {
            item.status = 'UNLINKED'
          }
        } else {
          item.status = 'PENDING';
          item.isSubmitted = false;
          item.followerCount = 0;
        }
      });
      console.log("Merged SNS List: ", this.snsServiceList)
      resolve(true);
    });
  }

  getReferralInfo(){
    const that = this;
    return new Promise( (resolved, rejected) => {
      that.httpService.GetReferralInfoForUser(this.userData.id).subscribe( res => {
        console.log("referral Info: " + JSON.stringify(res));
        this.referralInfo  = res;
        this.socialImpactScore = res.socialImpactScore;
        resolved(res);
      },(e) => {
        //糟糕，出错了
        console.log("getReferralInfo Error: " + JSON.stringify(e));
        rejected(e)
     });
    });
  }
  
  getSocialImpactByUserId():Promise<any> {
    return new Promise( (resolved, rejected) => {
        this.httpService.GetSocialImpactByUserId().subscribe(res => {
          this.socialImpactList = res;
          this.mergeSnsWithSocialImpact().then(() => {
            this.socialImpactScore = 0;
            console.log("Social Impact List : ", this.socialImpactList);
            this.httpService.GetUserAccountInfo().subscribe(response => {
              localStorage.setItem("UserData", JSON.stringify(response));
              this.userData = response;
              this.socialImpactScore = response.socialImpactScore;
              console.log("My socialImpactScore:", this.socialImpactScore);
              this.cd.detectChanges();
              resolved(true);
            }, (e) => {
              this.presentToast("糟糕，出错了");
              console.log("GetSocialImpactByUserId Error: " + JSON.stringify(e))
              rejected(e)
            });
          });
        },(e) =>{
          this.presentToast("糟糕，出错了");
          console.log("GetSocialImpactByUserId Error: " + JSON.stringify(e))
          rejected(e)
        });
    });
  }

  getImage(pos) {
    console.log("Getting image from gallery")
    if (this.snsServiceList[pos].status === 'HOLD') {
      this.presentToast("正在审核中，请耐心等待！");
      return;
    }
    this.getImageFromGallery(pos);
  }

  upload(pos) {
    console.log("@upload", pos);
    let snsService = this.snsServiceList[pos];
    console.log(snsService.snsUserUrl);
    const url:String = snsService.snsUserUrl;
    if (this.isNotWeiboOrWechat(snsService)) {
      if (this.isEmptyUrl(url)) {
        this.presentToast("请输入您的社交媒体链接 ");
        return
      }

      if (!this.isValidUrl(url)) {
        this.presentToast("请提交正确的链接! \n 请提交正确的链接 !");
        return
      }
    }

    if (snsService.status === 'HOLD') {
      this.presentToast("你已成功提交社交媒体链接，影响力分数等待审核批准哦！");
      return;
    }

    if (this.imageContents.length <= 0) {
      this.presentToast("请选择图片");
      return;
    }
   
    console.log("Inside resize");
    const fileTransfer: FileTransferObject = this.transfer.create();
    var headers11 = {"Authorization": "Bearer " + GlobalVariable.token};

    let params = {
      'snsServiceId': snsService.id,
      'userId': localStorage.getItem("UserData.userId"),
    };
    if (this.isNotWeiboOrWechat(snsService)) {
      params['snsUserUrl'] = url;
    }
    let options: FileUploadOptions = {
      fileKey: 'socialImpactImage',
      fileName: GlobalVariable.uploadImgName,
      chunkedMode: false,
      mimeType: "image/jpeg",
      httpMethod: "post",
      params: params
    };
    console.log("**Option: ", options);
    options.headers = headers11;
    console.log("@@File Path : ", this.imageURI);
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆'
    });
    this.loader.present();
    fileTransfer.upload(this.imageURI, HttpService.baseUrl + "/socialimpact", options).then((data) => {
      console.log("uploading image to socialimpact");
      this.presentToast("图片已添加成功！");
      this.imageURI = '';
      this.imageContents = [];
      this.getUpdatedSocialImpactDataFromServer()
        .then(() => this.loader.dismiss());
      this.toggleID = -1;
    }, (err) => {
      this.toggleID = -1
      this.loader.dismiss();
      this.alertCtrl.create({
        title: "",
        message: "暂时出了问题，请稍后重试！",
        cssClass: 'okcancel',
        buttons: ["确定"]
      }).present();
    });
  }

  private getUpdatedSocialImpactDataFromServer() {
    return this.getSocialImpactByUserId().then(() => this.getReferralInfo());
  }

  private isValidUrl(url: String) {
    return (url.toLowerCase().includes("http://") || url.toLowerCase().includes("https://"));
  }

  private isEmptyUrl(url: String) {
    return url == null || url == "null" || url == '';
  }

  private isNotWeiboOrWechat(snsService: any) {
    return snsService.id !== 1 && snsService.id !== 2;
  }

  knowMore(title, detail) {
    this.navCtrl.push(KnowMorePage, {title: title, detail: detail})
  }

  getImageFromGallery(pos: any) {
    var args = {
      'selectMode': 100, //101=picker image and video , 100=image , 102=video
      'maxSelectCount': 1, //default 40 (Optional)
      'maxSelectSize': 188743680, //188743680=180M (Optional)
    };
    MediaPicker.getMedias(args, (medias) => {
      if (medias.length == 1) {
        this.imageURI = medias[0].uri;
        this.imageContents[pos] = this.imageURI;
      }
      this.cd.detectChanges();
    }, (e) => {
      this.presentToast(e);
    })
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  toggleGroup(index, item) {
    var __this = this;
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆',
      //duration: 1000
    });
    
    if (item.status == "HOLD") {
      return false
    }
    this.loader.present();
    console.log("toggle botton", item);

    let yOffset: any = document.getElementById(index).offsetTop;
    console.log(yOffset)

    if (item.id !== 1) { //Checks if it's NOT WEIBO
      if (this.toggleID == index) {
        this.toggleID = -1;
      } else {
        if (yOffset > 500) {
          yOffset = yOffset - 200
        } else {
          yOffset = yOffset + 200
        }
        console.log(yOffset)
        this.content.scrollTo(0, yOffset, 1000)
        this.toggleID = index;
      }
      this.loader.dismiss();
    } else { //If it's WEIBO
      this.toggleID = -1;
      if(item.status === 'UNLINKED' || item.status === 'PENDING') {
        item.status = 'APPROVED';
      } else if(item.status === 'APPROVED') {
        item.status = 'UNLINKED';
        this.presentConfirmWeiboLink("","确实要断开吗？",item);
        this.loader.dismiss();
        return;
      }
      this.updateSocialImpactWithWeibo(item).then(() => this.loader.dismiss());
    }
  };

  toggleRef(){
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆',
      duration: 10000
    });
    this.loader.present()
    const that = this;
    if(this.toggleID == 99){
      this.toggleID = -1;
    }else{
      this.toggleID = 99
    }
    
    setTimeout( () => {
      that.content.scrollToBottom()
      that.loader.dismiss()
    } , 100)
  }

  copyRefCode(){
    if(!this.platform.is("android") && !this.platform.is("ios") ){
          return;
    }
    console.log("copyRefCode: " + this.referralInfo.privateRefcode)
    this.clipboard.copy(this.referralInfo.privateRefcode);
    Util.showSimpleToastOnTop("数据已复制成功", this.toastCtrl);
  }

  /**
   * This method should take care of linking the weibo account
   * @param boxTitle 
   * @param boxContent 
   * @param item 
   */
  presentConfirmWeiboLink(boxTitle,boxContent,item) {
    console.log("@presentConfirmWeiboLink");
    let alert;
    let buttons = [];
    buttons.push({
      text: 'Ok',
      handler: () => {
        console.log("@presentConfirmWeiboLink handler with ", item);
        this.loader = this.loadingCtrl.create({
          spinner: 'dots',
          content: '正在登陆',
          duration: 4000
        });
        if(item.status === 'APPROVED') {
          this.loader.present();
          console.log("I'm going to link WEIBO");
          return this.linkWeibo(item).then(() => this.loader.dismiss());
        } else if(item.status === 'UNLINKED') {
          console.log("I'm going to unlink WEIBO");
          
          this.loader.dismiss();
          return this.unlinkWeibo(item);
        }
      }
    })
    
    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        if(item.status === 'APPROVED')
          item.status = 'UNLINKED';
        else if(item.status ==='UNLINKED')
          item.status = 'APPROVED';
        alert.dismiss();
      }
    })
    
    alert = this.alertCtrl.create({
      title: boxTitle,
      message: boxContent,
      buttons: buttons,
      cssClass: 'okcancel',
      enableBackdropDismiss: false
    });
    alert.present();
  }
  unlinkWeibo(item: any) {
    console.log("Unlink Weibo");
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆',
      duration: 4000
    });
    this.loader.present();
    let weiboSocialImpact = item;
    let data = this.socialImpactList.find(data => {
      return data.snsServiceId === weiboSocialImpact.id;
    });
    if(data) {
      data.snsStatus = 'UNLINKED';
      this.httpService.UpdateSocialImpact(data.id, data).then(() => {
        this.logoutAndGetUpdatedSocialImpact()
      })
    } else {
      this.logoutAndGetUpdatedSocialImpact()
    }
    
  }
  logoutAndGetUpdatedSocialImpact() {
    var __this = this;
    console.log("Logging out from weibo after unlinking");
    if(localStorage.getItem('access_token')) {
      WeiboSDK.logout(function () {
        localStorage.removeItem('access_token');
        localStorage.removeItem("authorized_weibo");
        localStorage.removeItem("weibo_user_id");
        console.log('logout success');
        return __this.getUpdatedSocialImpactDataFromServer()
          .then(() => __this.loader.dismiss())
          .catch((reason) => __this.loader.dismiss());
      }, function (failReason) {
        console.log("Weibo Logout failed : ", failReason);
        return __this.getUpdatedSocialImpactDataFromServer()
          .then(() => __this.loader.dismiss())
          .catch((reason) => __this.loader.dismiss());
      });
    } else {
      return __this.getUpdatedSocialImpactDataFromServer()
          .then(() => __this.loader.dismiss())
          .catch((reason) => __this.loader.dismiss());
    }
  }
  linkWeibo(item: any):Promise<any> {
    console.log("creating loader inside linkWeibo");
    var __this = this;
    console.log("Link Weibo");
    let userId = localStorage.getItem('UserData.userId');
    let authorized_weibo = localStorage.getItem("authorized_weibo") == null ? false : localStorage.getItem("authorized_weibo");
    let access_token = localStorage.getItem("access_token");
    let weibo_user_id = localStorage.getItem("weibo_user_id");
    console.log("linking weibo", userId, authorized_weibo, access_token, weibo_user_id);
    if(!authorized_weibo) {
      WeiboSDK.ssoLogin(function (args) { //Login with weibo
        localStorage.setItem("authorized_weibo", "true");
        localStorage.setItem("weibo_user_id", args.userId);
        localStorage.setItem("access_token", args.access_token);
        access_token = args.access_token;
        weibo_user_id = args.userId;
        return __this.canUserLoginWithWeiboToken(userId, args.userId)
          .then((data) => {
            __this.updateUserWeiboSocial(args.userId);
          })
          .then(() => {
            return __this.createOrUpdateWeiboSocialImpact(args.access_token, args.userId, item);
          })
          .then(() => {
            //__this.loader.dismiss();
            console.log("dismissing loader @linkWeibo1");
            return new Promise((resolve) => resolve(true));
          })
          .catch((reason) => {
            console.error(reason);
            localStorage.removeItem("authorized_weibo");
            localStorage.removeItem("weibo_user_id");
            localStorage.removeItem("access_token");
            __this.login_type = "";
            //Should show an error on screen
            __this.loader.dismiss();
            __this.presentToast("该账号已被其他用户关联")
            item.status = 'UNLINKED';
            console.log("dismissing loader @linkWeibo2");
          });
      }, function (failReason) {
        console.log("cancel by :", failReason);
        item.status = "UNLINKED";
        __this.loader.dismiss();
      });
    } 
    else {
      console.log("Autolinking without weibo login");
      return __this.createOrUpdateWeiboSocialImpact(access_token, weibo_user_id, item)
        .then(() => {
          console.log("weibo social impact record created");
          __this.loader.dismiss();
          return new Promise((resolve) => resolve(true));
        })
        .catch((reason) => {
          console.error(reason);
          localStorage.removeItem("authorized_weibo");
          localStorage.removeItem("weibo_user_id");
          localStorage.removeItem("access_token");
          __this.loader.dismiss();
          //Should show an error on screen
          __this.presentToast("该账号已被其他用户关联")
          item.status = 'UNLINKED';
          console.log("dismissing loader @linkWeibo4");
        });
    }
    
    
  }

  createOrUpdateWeiboSocialImpact(access_token, weiboUserId, item):Promise<any> {
    console.log("@createOrUpdateWeiboSocialImpact");
    return this.httpService.GetUserDataFromWeibo(access_token, weiboUserId).toPromise()
      .then((data) => {
        console.log("data from weibo", data);
        let weiboSocialImpact = item;
        console.log("current item to create or update", weiboSocialImpact);
        let bodyPayload = {
          followerCount: data.followers_count,
          snsStatus: item.status,
          snsToken: access_token,
          snsServiceId: 1,
          userId: localStorage.getItem('UserData.userId')
        };
        return this.httpService.CreateSocialImpactWeibo(bodyPayload)
          .then(() => this.getSocialImpactByUserId())
      }).catch((reason) => {
        throw new Error("Error when creating weibo social impact");
      });
  }

  updateUserWeiboSocial(weiboSocialUniqueId: any):Promise<any> {
    console.log("Updating current user weibo social id");
    return this.httpService.UpdateUserWeiboSocial(weiboSocialUniqueId);
  }
  canUserLoginWithWeiboToken(userId: string, weiboUserId: any):Promise<any> {
    console.log("@canUserLoginWithWeiboToken");
    return new Promise((resolve, reject) => {
      this.httpService.CheckWeiboUserAvailabilityForUserId(weiboUserId, userId).subscribe(response => {
        if(response.available)
          resolve(true);
        reject(false);
      }, (error) => {
        reject("User cannot login with this token");
      });
    });
  }

  connectAndUpdateWeibo(item):Promise<any>{
    console.log("@connectAndUpdateWeibo ", item);
    return new Promise((resolve, reject) => {
      var prm = this.updateWeiboSocialImpact(item);
      resolve(true);
    });
  }

  updateSocialImpactWithWeibo(item):Promise<any> {
    const loginType = localStorage.getItem('login_type') || null;
    var __this = this;
    console.log("Weibo item", item);
    console.log("Going to do something with WEIBO");
    return new Promise((resolve, reject) => {
      console.log("Going inside promise updateSocialImpactWithWeibo");
      this.connectAndUpdateWeibo(item)
        .then(() => resolve(true))
        .catch((error) => reject(false));
    });
  }

  userComesFromWeiboLogin() {
    return this.login_type === "WEIBO"
  }

  updateWeiboSocialImpact(item):Promise<any>{
    var status = item.status;
    
    console.log("returning promise for link case");
    return this.linkWeibo(item);
  }

}
