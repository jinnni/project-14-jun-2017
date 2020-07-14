import {Component} from '@angular/core';
import {SettingsProvider} from "../../providers/settingsProvider";
import {ProfileSocialImpactPage} from "../profile-social-impact/profile-social-impact";
import {IonicPage, AlertController, NavController, NavParams, Platform, ToastController} from "ionic-angular";
import {ProfileSettingsPage} from "../profile-settings/profile-settings";
import {SurveyPage} from "../survey/survey";
//import surveys from "../../data/surveys";
import {CampaignListPage} from "../campaign-list/campaign-list";
import {ProfileMyBadgePage} from "../profile-my-badge/profile-my-badge";
import {ProfileLikedProductsPage} from "../profile-liked-products/profile-liked-products";
import {CustomHtmlPage} from "../custom-html/custom-html";
import {ProfileMyUgcPage} from "../profile-my-ugc/profile-my-ugc";
import {ProfileMyPicturePage} from "../profile-my-picture/profile-my-picture";
import {ProfileMyLikePage} from "../profile-my-like/profile-my-like";
import {FollowersPage} from "../followers/followers";
import {FollowingsPage} from "../followings/followings";
import {HttpService} from "../../services/httpService";
import {NativePageTransitions, NativeTransitionOptions} from '@ionic-native/native-page-transitions';
import {Util} from "../../global/util";
import {Camera, CameraOptions} from '@ionic-native/camera';
import {GlobalVariable} from "../../global/global.variable";
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {UserService} from "../../services/userService";
import {Crop} from "@ionic-native/crop";
import { EditorScorePage } from '../editor-score/editor-score';
import { AppVersion } from '@ionic-native/app-version';
declare let MediaPicker;
@IonicPage({
  segment: 'profile'
})
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  profileData = {
    name: '泡泡糖',
    followerCount: 234,
    followedCount: 587,
    socialImpactScore: 1036,
    surveyCompletion: 0.73,
    badgeEared: 2,
    profileScore: 10
  };

  menuItems = [
    {
      id: 11,
      name: '粉丝专题',
      image: 'assets/img/profile/1.png'
    },
    {
      id: 13,
      name: '我的关注',
      image: 'assets/img/profile/3.png',
    },
    {
      id: 32,
      name: '心愿清单',
      image: 'assets/img/profile/wishlist.png'
    }
  ];

  surveyCompletionPercentage: string;
  surveyCompletionLeftPercentage: string;
  backgroundImageFromLocal: string;
  profileImage = '';
  backgroundImage = '';

  userFollowersList: any;
  userFollowingsList: any;
  userData: any;
  imageUrl: any;
  socialProfilePic: any;
  followersCount = 0;
  followingCount = 0;
  socialImpactScore = 0;
  likedProductsCount = 0;
  campaigns: any = [];
  badgesCounter;
  counter: number = 0;
  imageURI: any;
  imageFileName: any;
  imageContents: any;
  public imagess: any = [];
  isGuestUser:boolean;
  editorScore;
  version;
  available;
  campaignScore = 0;
  constructor(private settingsProvider: SettingsProvider,
              private navCtrl: NavController,
              public platform: Platform,
              public navParams: NavParams,
              private alertCtrl: AlertController,
              private camera: Camera,
              public toastCtrl: ToastController,
              private userService: UserService,
              private transfer: FileTransfer,
              private cropService: Crop,
              private appVersion: AppVersion,
              private nativePageTransitions: NativePageTransitions,
              private httpService: HttpService) {
    this.settingsProvider.isMenuOpened = false;
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.socialImpactScore = this.userData.socialImpactScore;
    this.backgroundImageFromLocal = localStorage.getItem("UserData.backgroundImage");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    if (!GlobalVariable.isAuthUser) {
      this.isGuestUser = false;
    } else {
      this.isGuestUser = true;
      Util.registerBackButton(platform, this.counter, toastCtrl);
    }
  }
  doProfileRefresh(refresher) {
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.getUserAccountInfo();
    this.getUserFollowingFollowerCount();
    this.getEditorScore();
    this.getProductsLikeByUser();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }
  getPendingCampaignCount(){
    this.httpService.GetPendingCampaignCount().subscribe(res =>{
      this.settingsProvider.campBadgeCounter = res.pendingChallenges + res.pendingPostSurveys;
      this.settingsProvider.qtcBadgeCounter = res.pendingQTC;
    });
  }
  ionViewDidEnter() {
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    this.setVersion();
    this.getUserAccountInfo();
    this.getUserFollowingFollowerCount();
    this.getEditorScore();
    this.getProductsLikeByUser();
    this.getPendingCampaignCount();
    Util.registerBackButton(this.platform, this.counter, this.toastCtrl);
  }

  getProductsLikeByUser() {
    this.httpService.GetProductsLikeByUser(parseInt(localStorage.getItem("UserData.userId"))).subscribe(res => {
      this.likedProductsCount = res.length;
    });
  }
  getEditorScore(){
    this.httpService.GetEditorScore(localStorage.getItem("UserData.userId")).subscribe(res => {
      this.editorScore = res.score;
    });
  }
  //Updates user account info across all the app via localStorage UserData update
  getUserAccountInfo() {
    this.httpService.GetUserAccountInfo().subscribe(res => {
      localStorage.setItem("UserData", JSON.stringify(res));
      this.userData = res;
      this.updatePercent(res.profileScore);
      if (res.hasOwnProperty("profileImage")) {
        if (res.profileImage.search("http") != -1) {
          this.socialProfilePic = localStorage.getItem("socialProfilePic");
        } else {
          this.profileImage = res.profileImage;
        }
      }
      if (res.hasOwnProperty("backgroundImage")) {
        this.backgroundImage = res.backgroundImage;
      }
      this.socialImpactScore = res.socialImpactScore;
    });
  }

  updatePercent(percent: number) {
    const num = Math.ceil(percent);
    this.surveyCompletionPercentage = num + "%";
    this.surveyCompletionLeftPercentage = (100 - num) + '%';
  }

  showMenuItem(menuItemId: number) {
    switch (menuItemId) {
      case 11: {
        this.navCtrl.push(ProfileMyUgcPage, {
          title: "粉丝专题",
          userId:localStorage.getItem("UserData.userId")
        });
        break;
      }
      case 12: {
        this.navCtrl.push(ProfileMyPicturePage, {
          title: "我的图片",
          userId: localStorage.getItem("UserData.userId")
        });
        break;
      }
      case 13: {
        this.navCtrl.push(ProfileMyLikePage, {
          title: "我的关注",
          userId: localStorage.getItem("UserData.userId")
        });
        break;
      }
      case 14: {
        break;
      }
      case 21: {
        this.navCtrl.push(CustomHtmlPage, {
          title: "必备 APP",
          content: "必备 APP"
        });
        break;
      }
      case 31: {
        this.navCtrl.push(ProfileSettingsPage);
        break;
      }
      case 32: {
        this.showMyWishLsit();
        break;
      }
    }
  }
  async setVersion(){
    let appVersionData = await this.appVersion.getVersionNumber().catch(()=>{});
    let packageName = await this.appVersion.getPackageName().catch(()=>{});
    let latestVersion = await this.httpService.GetCurrentVersion().toPromise().catch(()=>{});
    var savedVersion = await localStorage.getItem("version_checked_for");
    let platformStr: string;
    if (this.platform.is("ios")) {
      platformStr = "Ios";
    } else if(this.platform.is("android")) {
      platformStr = "Android";
    } else {
      platformStr = "Android"; //Default for now
    }
    this.version = appVersionData;
    if(!this.version) {
      console.log("undefined version, setting to latest");
      this.version = latestVersion[platformStr].version;
    }
    if(latestVersion[platformStr] != undefined){
      this.available = latestVersion[platformStr].version
    }
  }

  matchAppVersion(current,available){
    var temp = current.split(".");
    var temp_;
    var isNotMatch = false;
    temp_ = available.split(".");
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
  
  goToSettings() {
    // this.navCtrl.push(ProfileSettingsPage,{"version": this.version,"setButton":this.available != this.version, "available": this.available});
    this.navCtrl.push(ProfileSettingsPage,{"version": this.version,"setButton":this.matchAppVersion(this.version,this.available), "available": this.available});
  }

  test() {
    let percent = 0;
    setInterval(() => {
      percent += 0.01;
      if (percent > 1) {
        percent = 0;
      }
      this.updatePercent(percent);
    }, 50);
  }

  showSurveyPage() {
    this.navCtrl.push(SurveyPage, {type: "profile"});
  }

  showMyBadge() {
    this.navCtrl.push(ProfileMyBadgePage, {
      userId:  localStorage.getItem("UserData.userId"),
      title: "我的勋章"
    });
  }

  showMyWishLsit() {
    this.navCtrl.push(ProfileLikedProductsPage, {
      userId: this.userData.id,
      title: "心愿清单"
    });
  }

  getUserFollowingFollowerCount() {
    this.httpService.GetUserFollowingFollowerCounts().subscribe(res => {
      this.followingCount = res.followingCount;
      this.followersCount = res.followerCount;
    });
  }

  showFollowers() {
    this.navCtrl.push(FollowersPage, {list: this.userFollowersList});
  }

  showFollowing() {
    this.navCtrl.push(FollowingsPage, {list: this.userFollowingsList});
  }
  showSocialImpactPage(){
    this.navCtrl.push(ProfileSocialImpactPage, {userData: this.userData});
  }
  showCampaignListPage(){
    this.navCtrl.push(CampaignListPage)
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
    this.settingsProvider.currentPageRefresh = "none";
    let options: NativeTransitionOptions = {
      direction: 'up',
      duration: 0,
      slowdownfactor: 0,
      slidePixels: 0,
      iosdelay: 0,
      androiddelay: 0,
      fixedPixelsTop: 0,
      fixedPixelsBottom: 0
     };
     this.nativePageTransitions.fade(options);
  }

  addImage(type: string) {
    this.settingsProvider.isMenuOpened = false;
    const prompt = this.alertCtrl.create({
      title: "請選擇文件",
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
      let newPath = "";
      if (type == "profile") {
        newPath = "/users/" + this.userData.id + "/profile";
      } else {
        newPath = "/users/" + this.userData.id + "/background";
      }
      this.cropImageAndPostUploadProfilePicture(this.imageURI, newPath);
    }, (err) => {
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
      this.cropImageAndPostUploadProfilePicture(this.imageURI, newPath);
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
  
  cropImageAndPostUploadProfilePicture(imagePath,path){
    var self = this;
    // var options = {
    //   url: imagePath,
    //   ratio: "1/1",
    //   title: "展示最美的我",
    //   autoZoomEnabled: false
    // }
    self.cropService.crop(imagePath, {quality: 75,targetHeight:100,targetWidth:100}).then(
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
            self.socialProfilePic = localStorage.getItem("socialProfilePic");
            self.presentToast("你的图片添加已成功！");
          })
        }, (err) => {});
      },
      error => console.error('Error cropping image', error)
  );
  }
  showScorePage() {
    this.navCtrl.push(EditorScorePage,{'userId' : localStorage.getItem("UserData.userId")});
  }
}
