import {Component} from '@angular/core';
import {Util} from "../../../global/util";
import {UserService} from "../../../services/userService";
import {HttpService} from "../../../services/httpService";
import {TokenService} from "../../../services/tokenService";
import {SignUpProfilePage} from "../sign-up-profile/sign-up-profile";
import {SignInUpPage} from "../../sign-in-up/sign-in-up";
import {Headers, Http, RequestOptions} from "@angular/http";
import {AppSettings} from "../../../app/app.settings";
import {LoadingController, NavController, ToastController, App, AlertController} from 'ionic-angular';
import {SignUpSocialUserPage} from "../sign-up-social-user/sign-up-social-user";
import { InitialPage } from '../../initial/initial';
import { FileTransferObject, FileUploadOptions, FileTransfer } from '@ionic-native/file-transfer';
import { GlobalVariable } from "../../../global/global.variable";
import { File } from '@ionic-native/file';
import { Platform } from 'ionic-angular';

declare let Wechat:any;
declare let WeiboSDK:any;

@Component({
  selector: 'component-sign-up',
  templateUrl: 'sign-up.html',
})
export class SignUpComponent {

  weChatData:any;
  imageUrl: string;
  phoneNumber: string;
  password: string;
  code: string;
  /*Send Verification Code*/
  sendCodeButtonText = "发送验证码";
  sendCodeButtonIsDisabled = false;
  agreementIsChecked: boolean;
  loader;
  constructor(private navCtrl: NavController,public appCtrl: App,
              private loadingCtrl: LoadingController,
              public toastCtrl: ToastController,
              private userService: UserService,
              private httpService: HttpService,
              private tokenService: TokenService,
              public platform: Platform,
              public file: File,
              private alertCtrl: AlertController,
              private transfer: FileTransfer,
              private http: Http)

  {  
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
  validatePhoneNumber() {
    return (this.phoneNumber != null) &&
      (!!this.phoneNumber.match("^[0-9]{11}$"));
  }

  validUserExists(){
    this.httpService.accountStatus(this.phoneNumber)
    .subscribe((response: any) => {
      console.log("validUserExists: " + JSON.stringify(response))
      if(response.status){
        doPhoneVerificationCheck()
      }else{
        // User with phone account already in use
        this.alertbox(" 此手机号已注册过！");
      }
    })

    const doPhoneVerificationCheck = () => {
      this.httpService.phoneVerificationCheck(this.phoneNumber)
      .subscribe((response: any) => {
        if(response.status){
          if(response.code === 1) {
            this.alertbox("你已有有效的验证码，请确认后输入正确的验证码！或等5分钟后重新获取新验证码，谢谢！");
          } else {
            this.alertbox("你已经注册了！不需要重新注册哦！");
            this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
          }
        }else{
          this.sendVerificationCode();
        }
      })
    }
  
  }

  validatePassword() {
    return (this.password != null) && (this.password.trim().length > 0);
  }

  sendVerificationCode() {
    if (this.sendCodeButtonIsDisabled) return;

    if (!this.validatePhoneNumber()) {
      Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
      return;
    }
    if (!this.validatePassword()) {
      Util.showSimpleToastOnTop("请正确输入密码！密码需由8位以上英文字母与数字组成。", this.toastCtrl);
      return;
    }

    const sendIntervalTime = 60;

    this.sendCodeButtonIsDisabled = true;
    let second = sendIntervalTime;
    this.sendCodeButtonText = second + "秒";

    const intervalId = setInterval(() => {
      second -= 1;
      this.sendCodeButtonText = second + "秒";
    }, 1 * 1000);

    setTimeout(() => {
      clearInterval(intervalId);
      this.sendCodeButtonText = "重新发送";
      this.sendCodeButtonIsDisabled = false;
    }, sendIntervalTime * 1000);

    this.userService.verifyPhoneNumber(this.phoneNumber,this.password)
      .subscribe(res => {
        Util.showSimpleToastOnTop(res.data, this.toastCtrl);
      });
  }

  register() {
    if(!this.agreementIsChecked) {
      Util.showSimpleToastOnTop("请同意免责声明。", this.toastCtrl);
      return;
    }

    if (!this.validatePhoneNumber()) {
      Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
      return;
    }

    if (!this.validatePassword()) {
      Util.showSimpleToastOnTop("请正确输入密码！密码需由8位以上英文字母与数字组成。", this.toastCtrl);
      return;
    }

    if (this.code == null || this.code.trim().length == 0) {
      Util.showSimpleToastOnTop("请正确输入验证码！", this.toastCtrl);
      return;
    }

    const header = new Headers();
    header.set("Content-Type", "application/json");

    this.http.post(AppSettings.BASE_URL+UserService.basePath, JSON.stringify({
      "phoneNumber": this.phoneNumber,
      "password": this.password,
      "code": this.code
    }),
    new RequestOptions({headers: header}))
    .subscribe(res => {
      var data = JSON.parse(res["_body"]);
      var result=data.data.id;
      localStorage.setItem("newId",data.data.id)
      this.tokenService.save(res.headers.get("Authorization").split(" ")[1]);
      this.navCtrl.push(SignUpProfilePage,{'resultData':result, Authorization: res.headers.get("Authorization")});
    }, (err) => {
      Util.showSimpleToastOnTop(err._body, this.toastCtrl);
    });
  }

  openWithCordovaBrowserWeibo(){
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
      _this.getWeiboData(args.access_token,args.userId);
    }, function (failReason) {
      console.log(failReason);
      _this.loader.dismiss();
    });
  }

  getWeiboData(access_token:any,userId:any){
    this.httpService.GetUserDataFromWeibo(access_token,userId).subscribe(response =>{
      this.loader.dismiss();
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_id', userId);
      this.httpService.CheckWeiboUserExists(response.idstr).subscribe(res => {
        if(res.status){
          let user = {
            "weiboSocialUniqueId": response.idstr
          }
          this.httpService.AddWeiboUserData(user).subscribe(res => {
            this.tokenService.save(res.id_token);
            this.getUserDetails("social",response.profile_image_url);
          });
        }else{
          this.navCtrl.push(SignUpSocialUserPage,{userData:response,socialType:"WEIBO"});
        }
      });
    });
  }

  openWithCordovaBrowserWeChat(){
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆'
    });
    this.loader.present();
    var scope = "snsapi_userinfo",
      state = "_" + (+new Date());
    var _this = this;
    Wechat.auth(scope,state,function (response) {
      _this.getWeChatAccessToken(response.code);
    }, function (reason) {
      console.log("Failed: " + reason);
      _this.loader.dismiss();
    });
  }

  getWeChatAccessToken(code:any){
    this.httpService.GetWeChatAccessToken(code).subscribe(res =>{
      this.loader.dismiss();
      this.httpService.GetWeChatUserData(res.access_token,res.openid).subscribe(response =>{
        this.httpService.CheckWechatUserExists(res.openid).subscribe(res => {
          if(res.status){
            let user = {
              "wechatSocialUniqueId": response.openid
            }
            this.httpService.AddWechatUserData(user).subscribe(res => {
              this.tokenService.save(res.id_token);
              this.getUserDetails("social",response.headimgurl);
            });
          }else{
            this.navCtrl.push(SignUpSocialUserPage,{userData:response,socialType:"WECHAT"});
          }
        });
      });
    });
  }


  getUserDetails(type:any,img:any){
    this.userService.getUserData()
      .subscribe(res =>{
        this.tokenService.saveUserId(res.id);
        this.tokenService.saveIsUserAuth(true);
        localStorage.setItem("UserData",JSON.stringify(res));
        localStorage.setItem("UserData.login",res.login);
        localStorage.setItem("UserData.phoneNumber",res.phoneNumber);
        localStorage.setItem("UserData.nickname",res.nickname);
        localStorage.setItem("UserData.userId",res.id);
        if(res.email == null){
          localStorage.setItem("UserData.email","Please Set New");
        }else{
          localStorage.setItem("UserData.email",res.email);
        }
        if(type == 'social'){
          localStorage.setItem("socialProfilePic",img);
          var self = this;
          const fileTransfer: FileTransferObject = this.transfer.create();
          var tempDirectory = this.platform.is("ios")? this.file.tempDirectory : this.file.externalDataDirectory;
          fileTransfer.download(this.imageUrl + res.profileImage, tempDirectory + "socialProfilePic.jpg").then((entry) => {
            const fileTransfer: FileTransferObject = self.transfer.create();
            let option: FileUploadOptions = {
              fileKey: 'file',
              fileName: GlobalVariable.uploadImgName,
              chunkedMode: false,
              headers: {"Authorization": "Bearer " + GlobalVariable.token},
              httpMethod: "post",
            }
            fileTransfer.upload(entry.nativeURL, HttpService.baseUrl + "/users/" + res.id + "/profile", option).then((data) => {
            }, (err) => {
              console.log("upload error");
            });
          }, (error) => {
            console.log("download-error");
          });
        }else if(type == 'normal'){
          if(res.hasOwnProperty("profileImage")){
            localStorage.setItem("socialProfilePic",this.imageUrl+res.profileImage);
          }else{
            if(res.gender == 'M'){
              localStorage.setItem("socialProfilePic","assets/img/profile/man.png");
            }else{
              localStorage.setItem("socialProfilePic","assets/img/profile/woman.png");
            }
          }
        }
        this.appCtrl.getRootNavs()[0].setRoot(InitialPage);
      });
  }


}
