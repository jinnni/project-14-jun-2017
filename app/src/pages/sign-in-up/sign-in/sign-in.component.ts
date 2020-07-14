import {Component} from '@angular/core';
import {LoadingController, NavController, ToastController, App, AlertController, Platform} from 'ionic-angular';
import {ForgotPasswordPage} from "../../forgot-password/forgot-password";
import {Util} from "../../../global/util";
import {UserService} from "../../../services/userService";
import {TokenService} from "../../../services/tokenService";
import {HttpService} from "../../../services/httpService";
import {SignUpSocialUserPage} from "../sign-up-social-user/sign-up-social-user";
import { InitialPage } from '../../initial/initial';
import { LandingPage } from '../../landing/landing';
import { FileTransferObject, FileTransfer, FileUploadOptions } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import {GlobalVariable} from "../../../global/global.variable";
import {ENV} from '@app/env';
declare let Wechat: any;
declare let WeiboSDK: any;

@Component({
  selector: 'component-sign-in',
  templateUrl: 'sign-in.html',
})
export class SignInComponent {
  phoneNumber: string;
  password: string;
  imageUrl: string;
  weChatData: any;
  loader;agreementIsChecked: boolean;
  showGuestUserAction :boolean;
  constructor(private navCtrl: NavController,public appCtrl: App,
              private loadingCtrl: LoadingController,
              private toastCtrl: ToastController,
              private userService: UserService,
              private tokenService: TokenService,
              public platform: Platform,
              public file: File,
              private alertCtrl: AlertController,
              private transfer: FileTransfer,
              private httpService: HttpService) {
                this.showGuestUserAction = ENV.setGuest;
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.weChatData = {};
    this.agreementIsChecked = true;
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆'
    });
  }
alertbox(boxContent){
  let alert;
    let buttons = [];
    var __this = this;
    buttons.push({
      text: '确定',
      handler: () => {
        alert.dismiss();
      }
    })
    alert = this.alertCtrl.create({
      title: '',
      message: boxContent,
      buttons: buttons,
      cssClass: 'okcancel',
      enableBackdropDismiss: false
    });
    alert.present();
}
  signIn() {
    if(!this.agreementIsChecked) {
      Util.showSimpleToastOnTop("请同意免责声明。", this.toastCtrl);
      return;
    }
    if (!this.validatePhoneNumber()) {
      Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
      return;
    }

    if (!this.validatePassword()) {
      Util.showSimpleToastOnTop("请正确输入密码！", this.toastCtrl);
      return;
    }
    this.loader.present();
    this.userService.signIn(this.phoneNumber, this.password)
      .subscribe((response: any) => {
        this.loader.dismiss();
        if (response.status == 401 || response.status == 400) {
          this.alertbox(response.detail);
        } else {
          this.tokenService.save(response.id_token);
          this.getUserDetails("normal", "");
        }
      });
  }

  validatePhoneNumber() {
    return (this.phoneNumber != null) &&
      (!!this.phoneNumber.match("^[0-9]{11}$"));
  }

  validatePassword() {
    return (this.password != null) && (this.password.trim().length > 0);
  }

  getUserDetails(type: any, img: any) {
    console.log("profile-image");
    
    console.log(img);
    
    this.userService.getUserData().subscribe(res => {
      this.tokenService.saveUserId(res.id);
      this.tokenService.saveIsUserAuth(true);
      localStorage.setItem("UserData", JSON.stringify(res));
      localStorage.setItem("UserData.login", res.login);
      localStorage.setItem("UserData.phoneNumber", res.phoneNumber);
      localStorage.setItem("UserData.nickname", res.nickname);
      localStorage.setItem("UserData.userId", res.id);

      if (res.email == null) {
        localStorage.setItem("UserData.email", "Please Set New");
      } else {
        localStorage.setItem("UserData.email", res.email);
      }
      if (type == 'social') {
        localStorage.setItem("socialProfilePic", img);
        console.log("1",this.imageUrl + res.profileImage);
        
          var self = this;
          const fileTransfer: FileTransferObject = this.transfer.create();
          var tempDirectory = this.platform.is("ios")? this.file.tempDirectory : this.file.externalDataDirectory;
          fileTransfer.download(this.imageUrl + res.profileImage, tempDirectory + "socialProfilePic.jpg").then((entry) => {
            console.log("download1");
            console.log(entry);
            const fileTransfer: FileTransferObject = self.transfer.create();
            let option: FileUploadOptions = {
              fileKey: 'file',
              fileName: GlobalVariable.uploadImgName,
              chunkedMode: false,
              headers: {"Authorization": "Bearer " + GlobalVariable.token},
              httpMethod: "post",
            }
            console.log("2",entry.nativeURL);
            fileTransfer.upload(entry.nativeURL, HttpService.baseUrl + "/users/" + res.id + "/profile", option).then((data) => {
            // fileTransfer.upload(res.profileImage, HttpService.baseUrl + "/users/" + res.id + "/profile", option).then((data) => {
              console.log("upload1");
              console.log(data);
              localStorage.setItem("socialProfilePic", this.imageUrl + res.profileImage);
            }, (err) => {
              console.log("upload error");
              console.log(err);
            });
          }, (error) => {
            console.log("download-error");
            console.log(error);;
          });
      } else if (type == 'normal') {
        if (res.hasOwnProperty("profileImage")) {
          localStorage.setItem("socialProfilePic", this.imageUrl + res.profileImage);
        } else {
          if (res.gender == 'M') {
            localStorage.setItem("socialProfilePic", "assets/img/profile/man.png");
          } else {
            localStorage.setItem("socialProfilePic", "assets/img/profile/woman.png");
          }
        }
      }
      // this.httpService.SetWeiboCountByUserId();
      this.appCtrl.getRootNavs()[0].setRoot(InitialPage);
    });
  }

  goToForgotPwd() {
    this.navCtrl.push(ForgotPasswordPage);
  }

  guestUser() {
    // this.appCtrl.unregisterRootNav(this.navCtrl);
    this.appCtrl.getRootNavs()[0].setRoot(LandingPage);
  }


  openWithCordovaBrowserWeibo() {
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆'
    });
    this.loader.present();
    var _this = this;
    WeiboSDK.ssoLogin(function (args) {
      localStorage.setItem("authorized_weibo", "true");
      localStorage.setItem("weibo_user_id", args.userId);
      localStorage.setItem("access_token", args.access_token);
      _this.getWeiboData(args.access_token, args.userId);

    }, function (failReason) {
      console.log(failReason);
      _this.loader.dismiss();
    });

  }

  getWeiboData(access_token: any, userId: any) {
    this.httpService.GetUserDataFromWeibo(access_token, userId).subscribe(response => {
      this.loader.dismiss();
      if (!!response) {
        localStorage.setItem("weibo_user_id",response.idstr)
        if('followers_count' in response){
          localStorage.setItem('weibo_followers_count', response.followers_count);

        }
        console.log("@SignInComponent GetUserDataFromWeibo");
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("user_id", userId);
        this.httpService.CheckWeiboUserExists(response.idstr).subscribe(res => {
          if (res.status) {
            let user = {
              "weiboSocialUniqueId": response.idstr
            };
            this.httpService.AddWeiboUserData(user).subscribe(res => {
              
              this.tokenService.save(res.id_token);
              this.getUserDetails("social", response.profile_image_url);
              localStorage.setItem("login_type", "WEIBO");
              return;
            }, error => console.log());
          } else {
            this.navCtrl.push(SignUpSocialUserPage, {userData: response, socialType: "WEIBO"});
          }
        }, error => console.log());
      } else {
      }
    }, error => console.log());
  }

  openWithCordovaBrowserWeChat() {
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆'
    });
    this.loader.present();
    var scope = "snsapi_userinfo", state = "_" + (+new Date());
    var _this = this;
    Wechat.auth(scope, state, function (response) {
      _this.getWeChatAccessToken(response.code);
    }, function (reason) {
      console.log(reason);
      _this.loader.dismiss();
    });
  }

  getWeChatAccessToken(code: any) {
    this.httpService.GetWeChatAccessToken(code).subscribe(res => {
      this.loader.dismiss();
      console.log("GetWeChatUserData");
      this.httpService.GetWeChatUserData(res.access_token, res.openid).subscribe(response => {
        console.log("CheckWechatUserExists");
        localStorage.setItem("access_token", res.access_token);
        localStorage.setItem("user_id", res.openid);
        this.httpService.CheckWechatUserExists(res.openid).subscribe(res => {
          console.log("Wechat user exists " + res.status);
          // res.status = false;
          if (res.status) {
            let user = {
              "wechatSocialUniqueId": response.openid
            }
            this.httpService.AddWechatUserData(user).subscribe(res => {
              console.log("AddWechatUserData, going to Timeline");
              this.tokenService.save(res.id_token);
              this.getUserDetails("social", response.headimgurl);
              localStorage.setItem("login_type", "WECHAT");
            });
          } else {
            this.navCtrl.push(SignUpSocialUserPage, {userData: response, socialType: "WECHAT"});
          }
        });
      });
    });
  }
}
