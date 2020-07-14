import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, ToastController, Platform, App, ViewController, NavParams, LoadingController} from "ionic-angular"
import {ProfileSettingsModifyPage} from "../profile-settings-modify/profile-settings-modify";
import {UserService} from "../../services/userService";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import {GlobalVariable} from "../../global/global.variable";
import {HttpService} from "../../services/httpService";
import {Camera, CameraOptions} from '@ionic-native/camera';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {Storage} from "@ionic/storage";
import {Util} from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
import {Crop} from "@ionic-native/crop";
import {AppVersion} from "@ionic-native/app-version";
import {File} from '@ionic-native/file';
import {ENV} from '@app/env';

import { Market } from '@ionic-native/market';
import { StorageService } from '../../services/storageService';
import { NotificationService } from '../../services/notificationService';
declare var window;
declare let MediaPicker;
declare let PjPlugin:any;
@IonicPage({})
@Component({
  selector: 'page-profile-settings',
  templateUrl: 'profile-settings.html',
})
export class ProfileSettingsPage {
  version;
  settingsData = [
    {
      name: "个人信息",
      image: "assets/img/icons/settings_personal.png",
      menuItems: [{
        id: 11,
        name: "添加头像"
      }, {
        id: 12,
        name: "添加背景图"
      }, {
        id: 13,
        name: "更改昵称"
      }, {
        id: 14,
        name: "修改手机号"
      }]
    }, {
      name: "账户设置",
      image: "assets/img/icons/settings_settings.png",
      menuItems: [{
        id: 21,
        name: "修改密码"
      }
      // , {
      //   id: 22,
      //   name: "修改邮箱"
      // }
    ]
    }
  ];

  x = {
    name: "帮助 & 支持",
    image: "assets/img/icons/settings_service.png",
    menuItems: [{
      id: 31,
      name: "常见问题"
    }, {
      id: 32,
      name: "服务条款 & 隐私协议"
    }, {
      id: 33,
      name: "关于我们"
    }]
  }
y= {
  menuItems: [{
    id: 41,
    name: "退出登录"
  }]
}
  imageURI: any;
  imageFileName: any;
  imageContents: any;
  userData: any;
  setButton;
  available;
  iosUrl: string;
  deviceToken: any;
  authorizedNotif: Boolean = false
  private resumeListener:any;
  constructor(private navCtrl: NavController,
              private alertCtrl: AlertController,
              public viewCtrl: ViewController,
              private userService: UserService,
              private toastCtrl: ToastController,
              private transfer: FileTransfer,
              private camera: Camera,
              public platform: Platform,
              private appVersion: AppVersion,
              private httpService: HttpService,
              private file: File,
              private storageService: StorageService,
              private market: Market,
              public navParams: NavParams,
              private cropService: Crop,
              private notificationService: NotificationService,
              private storage: Storage,public appCtrl:App,
              private loadingCtrl: LoadingController,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;

    if(this.platform.is("cordova")) {
      PjPlugin.notificationAuthorizationStatus( (authorized) => {
        this.authorizedNotif = authorized
  
      }, (e) => {
        this.authorizedNotif = false
      } );

      this.resumeListener = this.platform.resume.subscribe(() => {  
        console.log("Resume settings")
        PjPlugin.notificationAuthorizationStatus( (authorized) => {
          if( !this.authorizedNotif ){
             this.authorizedNotif   = true
          }
    
        }, (e) => {
          this.authorizedNotif   = false
  
        } )
  
      });
    }

    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.setButton = navParams.get("setButton");
    this.version = navParams.get("version");
    this.available = navParams.get("available");
    this.iosUrl = ENV.iosDownloadUrl;
  }

  getIosUrl() {
    return this.iosUrl;
  }
  
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      if(this.settingsProvider.productSlider){
         this.settingsProvider.productSlider.startAutoplay();
      }
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          if(this.settingsProvider.productSlider){
            this.settingsProvider.productSlider.stopAutoplay();
          }
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
          this.settingsProvider.productSlider.startAutoplay();
          this.settingsProvider.slider.startAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
        }
      }else{
        if(this.settingsProvider.productSlider){
          this.settingsProvider.productSlider.stopAutoplay();
        }
        if(this.settingsProvider.slider){
          this.settingsProvider.slider.stopAutoplay();
        }
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
  ionViewWillUnload(){
    if(this.resumeListener != null){
      this.resumeListener.unsubscribe();
    }
  }
  ionViewWillEnter() {
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform, this.navCtrl)
  }
  async checkUpdate(){
    let appVersionData = await this.appVersion.getVersionNumber()
    let packageName = await this.appVersion.getPackageName()
    let latestVersion = await this.httpService.GetCurrentVersion().toPromise();
    var savedVersion = await localStorage.getItem("version_checked_for");
    let platformStr: string;
      if (this.platform.is("ios")) {
        platformStr = "Ios";
      }
      if(this.platform.is("android")) {
        platformStr = "Android";
      }
      // if (latestVersion[platformStr].version != appVersionData && this.platform.is("android")) {
      if(this.matchAppVersion(appVersionData,latestVersion)){
        this.presentConfirm(packageName, false, appVersionData, platformStr.toLowerCase());
      }
  }
  matchAppVersion(current,available){
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
      console.log("download complete: " + entry.fullPath);

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

  toggleNotifications(){
    
    console.log("Toggle!");

    const that  = this;



    
     PjPlugin.notificationAuthorizationStatus( (resAuth) => {
      that.doRegister();
    } , (err) => {
      
        PjPlugin.openAppSettings((res) => {
        } )
    })

  }

  private doRegister(){

    const loader = this.loadingCtrl.create({
      spinner: 'dots',
      duration: 5000
    });
    if(!this.deviceToken){
      setTimeout( () => {
          localStorage.setItem("doDisablePush", null)
      } , 100)
    
      loader.present()
      this.notificationService.registerDevcie().then( (res) => {
        loader.dismiss()
        this.deviceToken = res
      }, (err) => {
        loader.dismiss()
      this.presentToast("糟糕，出错了");
      } ).catch( e => {}) 
    }else{
      loader.present()
      this.deviceToken = null;
      this.notificationService.unRegisterDevcie().then( () => {
        loader.dismiss()
      } ).catch( () => {
        loader.dismiss()
      } )
    }


  }
  promptForUpdateAndroid(entry) {
    window.plugins.intentShim.startActivity({
      action: window.plugins.intentShim.ACTION_VIEW,
      url: entry.toURL(),
      type: 'application/vnd.android.package-archive'
    },function() {},
    function() {console.log('Failed to open URL via Android Intent')}).then(()=>{
      console.log("success ");
      console.log("success to open URL via Android Intent. URL: " + entry.fullPath);
    }, (error)=>{
      console.log('Failed to open URL via Android Intent.');
      console.log("Failed to open URL via Android Intent. URL: " + entry.fullPath);
    });
  }
  openStore(packageName) {
    console.log(packageName);
    if (this.platform.is("cordova")) {
      this.market.open(this.iosUrl);
    }
  }
  showMenuItem(menuItemId: number) {
    console.log("profile settings showMenuItem");
    switch (menuItemId) {
      case 11:
        this.addImage("profile");
        break;
      case 12:
        this.addImage("profile-bg");
        break;
      case 13:
        this.navCtrl.push(ProfileSettingsModifyPage, "nickname");
        break;
      case 14:
        this.navCtrl.push(ProfileSettingsModifyPage, "phoneNumber");
        break;
      case 21:
        this.navCtrl.push(ProfileSettingsModifyPage, "password");
        break;
      case 22:
        this.navCtrl.push(ProfileSettingsModifyPage, "email");
        break;
      case 31:
        // this.navCtrl.push(ProfileSettingsFaqPage);
        break;
      case 32:
        //this.navCtrl.push(CustomHtmlPage, {
          //title: this.termsOfUseTitle,
          //content: this.termsOfUseContent
        //});
        break;
      case 33:
        // this.navCtrl.push(CustomHtmlPage, {
        //   title: this.aboutUsTitle,
        //   content: this.aboutUsContent
        // });
        break;
      case 41: //LOGOUT
        const prompt = this.alertCtrl.create({
          title: "",
          message: "确定要退出登陆吗？",
          cssClass: 'okcancel',
          buttons: [
            {
              text: "确定",
              handler: () => {
                if(this.platform.is("cordova")) {
                  this.notificationService.unRegisterDevcie().catch( e => {})
                }
                this.settingsProvider.productSlider.stopAutoplay()
                this.settingsProvider.productSlider = null
                this.settingsProvider.slider.stopAutoplay()
                this.settingsProvider.slider = null
                this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
                this.storageService.clearAll();
                this.navCtrl.popToRoot();
                this.navCtrl.setRoot(SignInUpPage);
                this.settingsProvider.campaignListResp=undefined;
               // this.viewCtrl.dismiss();
             //   this.storageService.clearAll();
              }
            }, {
              text: '取消',
              role: 'cancel',
              handler: () => {
              }
            }
          ]
        });
        prompt.present();
    }
  }
  addImage(type: string) {
    const prompt = this.alertCtrl.create({
      title: "",
      message: "請選擇文件",
      cssClass: 'okcancel',
      buttons: [
        {
          text: "拍一张照片",
          handler: () => {
            console.log('take a picture');
            this.getImageFromCamera(type);
          }
        }, {
          text: "从相册中选择",
          handler: () => {
            console.log('go to gallery');
            this.getImageFromGallary(type);
          }
        }, {
          text: '取消',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    prompt.present();
  }

  getImageFromCamera(type: string) {
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA
    }

    this.camera.getPicture(options).then((imageData) => {
      this.imageURI = imageData;
      this.imageContents = imageData;
      if (type == "profile") {
        let newPath = "/users/" + this.userData.id + "/profile";
        this.postUploadProfilePicute(this.imageURI, newPath);
      } else {
        let newPath = "/users/" + this.userData.id + "/background";
        this.postUploadProfilePicute(this.imageURI, newPath);
      }
    }, (err) => {
      console.log(err);
      this.presentToast(err);
    });
  }

  getImageFromGallary(type: string) {
    var args = {
      'selectMode': 100,
      'maxSelectCount': 1,
      'maxSelectSize': 188743680,
    };
    MediaPicker.getMedias(args, (medias) => {
      this.imageURI = medias[0].uri;
      this.imageContents = medias[0].uri;
      let newPath = "";
      if (type == "profile") {
        newPath = "/users/" + this.userData.id + "/profile";
      } else {
        newPath = "/users/" + this.userData.id + "/background";
      }
      this.postUploadProfilePicute(this.imageURI, newPath);
    }, (e) => {
      this.presentToast(e);
    })
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  postUploadProfilePicute(fileUri: string, path: string) {
    var self = this;
    // var options = {
    //   url: fileUri,
    //   ratio: "1/1",
    //   title: "展示最美的我",
    //   autoZoomEnabled: false
    // }

    self.cropService.crop(fileUri, {quality: 75,targetHeight:100,targetWidth:100}).then(
      newImage => {
        const fileTransfer: FileTransferObject = self.transfer.create();
        let option: FileUploadOptions = {
          fileKey: 'file',
          fileName: GlobalVariable.uploadImgName,
          chunkedMode: false,
          headers: {"Authorization": "Bearer " + GlobalVariable.token},
        }
        fileTransfer.upload(newImage, HttpService.baseUrl + path, option).then((data) => {
          self.userService.getUserData().subscribe(res => {
            localStorage.setItem("socialProfilePic", localStorage.getItem("myImageUrl") + res.profileImage);
            self.presentToast("你的图片添加已成功！");
          })
        }, (err) => {});
      },
      error => console.error('Error cropping image', error)
    );
  }
}
