import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, Platform, App, ToastController} from 'ionic-angular';
import { TimeLinePage } from '../timeline/timeline';
import {SignUpProfilePage} from "../sign-in-up/sign-up-profile/sign-up-profile";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import {TokenService} from "../../services/tokenService";
import {UserService} from "../../services/userService";
import {GlobalVariable} from "../../global/global.variable";
import {Util} from "../../global/util";
import {AndroidPermissions} from '@ionic-native/android-permissions';
import {AppVersion} from "@ionic-native/app-version";
import {HttpService} from "../../services/httpService";
import {platform} from "os";
import {Market} from "@ionic-native/market";
import {FileTransfer, FileTransferObject} from "@ionic-native/file-transfer";
import {File} from '@ionic-native/file';
import {ENV} from '@app/env';
import { LandingPage } from '../landing/landing';
import { error } from 'util';
import { NotificationService } from '../../services/notificationService';
import { StorageService } from '../../services/storageService';
import { PhotoLibrary } from '@ionic-native/photo-library';
declare var window;
declare let PjPlugin:any;
@IonicPage({
  segment: "initial"
})
@Component({
  selector: 'page-initial',
  templateUrl: 'initial.html'
})
export class InitialPage {
  iosUrl: string;
  constructor(public navCtrl: NavController,
              public appCtrl: App,
              private toastCtrl: ToastController,
              private tokenService: TokenService,
              private androidPermissions: AndroidPermissions,
              private userService: UserService,
              private appVersion: AppVersion,
              private httpService: HttpService, 
              private  platform: Platform, 
              private market: Market, 
              public alertCtrl: AlertController,
              private transfer: FileTransfer,
              private notificationService: NotificationService,
              private file: File,
              public photolib: PhotoLibrary,
              private storageService: StorageService) {
    this.tokenService.loadIsUserAuth().then(isAuthUser => {
      GlobalVariable.isAuthUser = isAuthUser;
    });
    this.iosUrl = ENV.iosDownloadUrl;
    if (this.platform.is("cordova")) {
      platform.ready().then(() => {
        // console.log("Platform ready has been called")
        this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE).then(
          result => console.log('Has permission?', result.hasPermission),
          err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_PHONE_STATE)
        ).catch(()=>{});
        this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_PHONE_STATE]).catch(()=>{});
        this.checkLogin()
        let self = this;
        let element = document.querySelector(".reloadApp");
        element.addEventListener("click",function(){
          self.checkLogin();
        })
      });
    }else{
      this.checkLogin()
      let self = this;
      let element = document.querySelector(".reloadApp");
      element.addEventListener("click",function(){
        self.checkLogin();
      });
    }
  }


  async checkConfigs() {
    console.log("@checkConfigs");
    await this.httpService.getConfigs().subscribe(res => {
      console.log(res);
      HttpService.baseUrl = res.backendUrl + "api/v1";
    })
  }

  async checkLogin() {
    if (this.platform.is("cordova")) {
        this.checkNotificationPermission()
        .then( () => this.verifyAppVersion() )
        .catch( () => this.verifyAppVersion() )

    }
    console.log("@checkLogin")
    await this.checkConfigs();
    this.tokenService.load().then(token => {
      // if there's any token in local storage
      if (token != null && token.length > 0) {
        console.log("My token is: " + token);
        GlobalVariable.token = token;
        this.userService.testToken().subscribe(res => {
            if (Util.isSucess(res) && GlobalVariable.isAuthUser) {
              console.log("tokenTest successful");
              // if the token is a validate one, saves the refreshed token
              this.tokenService.save(res.data);
              this.appCtrl.getRootNavs()[0].setRoot(LandingPage);
            } else {
              console.log("tokentest unsuccessful");
           //   this.notificationService.unRegisterDevcieWihReset()
              // if the token is a invalidate one
              let loginFlag = Util.getHasFormFilled();
              // console.log("tokenTest failed. LoginFlag " + loginFlag);
              if (loginFlag === 'normal') {
                this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage);
              } else if (loginFlag === 'wechat') {
                this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage, {socialType: "WECHAT"});
              } else if (loginFlag === 'weibo') {
                this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage, {socialType: "WEIBO"});
              } else {
                this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
              }
            }
        }, error => {
          //this.notificationService.unRegisterDevcieWihReset()
          console.log("Error in token test");
          if(error.status === 403) {
            console.log("User token totally invalid, going to login");
            this.storageService.clearAll();
            return ;
          }
          let loginFlag = Util.getHasFormFilled();
          // console.log("tokenTest failed. LoginFlag " + loginFlag);
          let userData = JSON.parse(localStorage.getItem("UserData"));
          let access_token = localStorage.getItem("access_token");
          let user_id = localStorage.getItem("user_id");
          if (loginFlag === 'wechat') {
            this.httpService.GetWeChatUserData(access_token, user_id).subscribe(response => {
              this.userService.getUserData().subscribe(res => {
                this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage, {
                  resultData: res.id,
                  socialType: "WECHAT",
                  'userData': response,
                  Authorization: token
                });
              });
            });
            
          } else if (loginFlag === 'weibo') {
            this.httpService.GetUserDataFromWeibo(access_token, user_id).subscribe(response => {
              this.userService.getUserData().subscribe(res => {
                this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage, {
                  resultData: res.id,
                  socialType: "WEIBO",
                  'userData': response,
                  Authorization: token,
                });
              });
            });
            
          } else {
            this.appCtrl.getRootNavs()[0].setRoot(SignUpProfilePage, {
              'userData': userData,
              Authorization: token,
              isFromLogIn: true
            });
          } 
        });
      } else {
        this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
      }
    }).catch(()=>{console.log("not cordova");});
  }

 async verifyAppVersion(){
    let appVersionData = await this.appVersion.getVersionNumber()
    let packageName = await this.appVersion.getPackageName()
    let latestVersion = await this.httpService.GetCurrentVersion().toPromise();
    var savedVersion = localStorage.getItem("version_checked_for");
    let platformStr: string;
    if (this.platform.is("ios")) {
      platformStr = "Ios";
    }
    if(this.platform.is("android")) {
      platformStr = "Android";
    }
    if (this.matchAppVersion(appVersionData,latestVersion)) {

        console.log("Version matched")
      if (latestVersion[platformStr].update == 'FORCE') {// && this.platform.is("android")
        this.presentConfirm(packageName, true, appVersionData, platformStr.toLowerCase());
      }
      if (savedVersion != appVersionData) {
        if (latestVersion[platformStr].update == 'OPTIONAL') {// && this.platform.is("android")
          this.presentConfirm(packageName, false, appVersionData, platformStr.toLowerCase());
        }
      }
    }

  }


  matchAppVersion(current,available){
    console.log(current);
    console.log(available);
    var temp = current.split(".");
    var temp_;
    var isNotMatch = false;
    if(this.platform.is("android")){
      temp_ = available["Android"].version.split(".");
    }else{
      temp_ = available["Ios"].version.split(".");
    }
    for (let index = 0; index < temp_.length; index++) {
      let x = temp[index] - temp_[index];
      if (x > 0) {
        return false;
      }
      if (x < 0) {
        return true;
      }
    }
    return isNotMatch;
  }

  checkNotificationPermission(){
    const that = this
    return new Promise( (resolve, reject ) => {
           PjPlugin.notificationAuthorizationStatus((authorized) => {
            resolve()
          }, (e) => {
            that.presentNotificationsDialog()
            .then( () => resolve() )
            .catch( () => reject() )  })

    } )

  }

  presentNotificationsDialog(){

    return new Promise((resolved, rejected)  => {
      let alert;
      let buttons = [];
      buttons.push({
        text: '立刻开通',
        cssClass: 'alertcss',
        handler: () => {
          alert.dismiss()
          
          this.notificationService.registerDevcie()
          .then( () => {
            secondAction()
          } ).catch( () => {
            secondAction()
          } )
          const secondAction = () => {
            PjPlugin.notificationAuthorizationStatus((authorized) => {
              resolved()
            }, (e) => {
              PjPlugin.openAppSettings((res) => {
                resolved()
              }, (e) => {
                  rejected()
              } )
            
            })
          }
          return false
        }
      })
  
        buttons.push({
          text: '后期开通',
          role: 'cancel',
          cssClass: 'alertcss',
          handler: () => {
            alert.dismiss()
            resolved()
            return false
          }
        })
      alert = this.alertCtrl.create({
        title: "通知设置",
        message: '开通了评价达人的“通知”功能，此通知功能往后让达人们不会错过任何宝BOX活动以及其他活动的邀请了！我们爱评价达人们~！',
        buttons: buttons,
        enableBackdropDismiss: false,
        cssClass: 'alertwrapper'
      });
      alert.present();
    } )

  }
  presentConfirm(packageName, force, version, os) {
    let alert;
    let buttons = [];
    var __this = this;
    if(os == 'ios'){
      buttons.push({
        text: '更新',
        cssClass: 'alertcss',
        handler: () => {
          if (os == 'ios') {
            __this.openStore(packageName)
          }
          // else {
          //   __this.downloadApkAndOpen(version);
          // }
          alert.dismiss();
          return false
        }
      })
    }
    if(os != 'ios'){
      buttons.push({
        text: '更新',
        cssClass: 'alertcss',
        handler: () => {
          window.open(ENV.apkDownloadUrl,'_system','location=yes');
          alert.dismiss();
          return false
        }
      })
    }
    if (!force) {
      buttons.push({
        text: '取消',
        role: 'cancel',
        cssClass: 'alertcss',
        handler: () => {
          localStorage.setItem("version_checked_for", version)
        }
      })
    }
    alert = this.alertCtrl.create({
      title: ' 你需要更新APP',
      message: '为了更好的体验，我们更新了APP，希望你使用愉快！',
      buttons: buttons,
      enableBackdropDismiss: false,
      cssClass: 'alertwrapper'
    });
    alert.present();
  }
  downloadApkAndOpen(version) {
    const fileTransfer: FileTransferObject = this.transfer.create();
    var uri = encodeURI(ENV.apkDownloadUrl);
    let toast1 = this.toastCtrl.create({
      message: '下载中...',
      position: 'bottom'
    });
    toast1.present();
    var path;
    fileTransfer.download(uri, this.file.externalDataDirectory + 'pjdaren-'+version+'.apk').then((entry) => {
      path=entry.nativeURL;
      // console.log("download complete: " + entry.fullPath);

            this.promptForUpdateAndroid(entry);
    }, (error) => {
      toast1.dismiss(); 
      let toast3 = this.toastCtrl.create({
        message: '有问题出现，过一会儿重试一下！',
        duration: 2000,
        position: 'bottom'
      });
      toast3.present();
    })
  }
  promptForUpdateAndroid(entry) {
    window.plugins.intentShim.startActivity({
      action: window.plugins.intentShim.ACTION_VIEW,
      url: entry.toURL(),
      type: 'application/vnd.android.package-archive'
    },function() {},
    function() {console.log('Failed to open URL via Android Intent')}).then(()=>{
      // console.log("success ");
      // console.log("success to open URL via Android Intent. URL: " + entry.fullPath);
    }, (error)=>{
      console.log('Failed to open URL via Android Intent.');
      // console.log("Failed to open URL via Android Intent. URL: " + entry.fullPath);
    });
  }
  openStore(packageName) {
    if (this.platform.is("cordova")) {
      // this.market.open(this.iosUrl);
      window.open(this.iosUrl,'_system','location=yes');

    }
  }
}