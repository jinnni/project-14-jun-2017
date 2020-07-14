import {Component} from '@angular/core';
import {IonicPage,NavController,NavParams,ToastController,LoadingController,ViewController,Platform,App,AlertController} from 'ionic-angular';
import {HttpService} from "../../../services/httpService";
import {SignUpProfilePage} from "../sign-up-profile/sign-up-profile";
import {TimeLinePage} from "../../timeline/timeline";
import {Util} from "../../../global/util";
import {TokenService} from "../../../services/tokenService";
import {UserService} from "../../../services/userService";
import {AppSettings} from "../../../app/app.settings";
import {Headers, Http, RequestOptions} from "@angular/http";
import { InitialPage } from '../../initial/initial';

@IonicPage()
@Component({
  selector: 'page-sign-up-social-user',
  templateUrl: 'sign-up-social-user.html',
})
export class SignUpSocialUserPage {
  userData: any;
  socialType: any;
  phoneNumber: string;
  password: string;
  code: string;
  sendCodeButtonText = "发送验证码";
  sendCodeButtonIsDisabled = false;
  agreementIsChecked: boolean;
  isLoginForm: boolean;
  isRegForm: boolean;
  imageUrl: string;
  public unregisterBackButtonAction: any;
  loader;
  constructor(public navCtrl: NavController,
              public appCtrl: App,
              private alertCtrl: AlertController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              private tokenService: TokenService,
              private httpService: HttpService, public platform: Platform,
              private userService: UserService,
              private http: Http,
              private toastCtrl: ToastController,
              private viewCtrl: ViewController) {
    this.agreementIsChecked = true;
    this.userData = navParams.get("userData");
    console.log("***UserData : ", this.userData)
    this.socialType = navParams.get("socialType");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.isLoginForm = true;
    this.loader = this.loadingCtrl.create({
      spinner: 'dots',
      content: '正在登陆'
    });
  }

  ionViewDidLoad() {
    this.initializeBackButtonCustomHandler();
  }

  ionViewWillLeave() {
    // Unregister the custom back button action for this page
    this.unregisterBackButtonAction && this.unregisterBackButtonAction();
  }

  initializeBackButtonCustomHandler(): void {
    this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function (event) {
      console.log('Prevent Back Button Page Change');
    }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
  }

  ionViewWillEnter() {
    this.viewCtrl.showBackButton(false);
  }

  signIn() {
    if (!this.validatePhoneNumber()) {
      Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
      return;
    }
    if (!this.validatePassword()) {
      Util.showSimpleToastOnTop("请正确输入密码！", this.toastCtrl);
      return;
    }
    this.loader.present();
    this.httpService.phoneCheck(this.phoneNumber).subscribe((response: any) => {
        if (response.code === 2) { //Phone number does not have a pending verification and exists. Can be logged in
          this.userService.signIn(this.phoneNumber, this.password).subscribe((response: any) => {
              this.loader.dismiss();
              if (response.status == 401 || response.status == 400) {
                this.alertCtrl.create({
                  title: "",
                  message: "登录出错，请重新登录！",
                  cssClass: 'okcancel',
                  buttons: ["确定"]
                }).present();

              } else {
                localStorage.setItem("login_type", this.socialType);
                if (this.socialType === "WECHAT") {
                  let dataUser = {
                    "phoneNumber": this.phoneNumber,
                    "wechatSocialUniqueId": this.userData.openid,
                    "wechatUserDto": this.userData
                  };

                  this.httpService.AddWechatUserData(dataUser).subscribe(res => {
                    this.tokenService.save(res.id_token);
                    this.getUserDetails('social', this.userData.headimgurl);
                    //this.navCtrl.push(TimeLinePage);
                    // this.appCtrl.getRootNavs()[0].setRoot(InitialPage);
                    return;
                  });
                } else if (this.socialType === "WEIBO") {
                  let dataUser = {
                    "phoneNumber": this.phoneNumber,
                    "weiboSocialUniqueId": this.userData.id,
                    "weiboUserDto": this.userData
                  };
                  console.log("* Params datauser : ", dataUser);
                  console.log("**** this.userData : ", this.userData);

                  this.httpService.AddWeiboUserData(dataUser).subscribe(res => {
                    console.log("AddWeiboUserData Res: ", res)
                    this.tokenService.save(res.id_token);
                    this.httpService.SetWeiboCountByUserId().then(data=>{

                    });
                    this.getUserDetails('social', this.userData.profile_image_url);
                    //this.navCtrl.push(TimeLinePage);
                    // this.appCtrl.getRootNavs()[0].setRoot(InitialPage);
                    return;
                  });
                }
              }
            });
        } else {
          this.loader.dismiss();
          this.isLoginForm = false;
          this.isRegForm = true;
        }
      });

  }

  signInRegister() {
    if (!this.agreementIsChecked) {
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

    this.http.post(AppSettings.BASE_URL + UserService.basePath, JSON.stringify({
        "phoneNumber": this.phoneNumber,
        "password": this.password,
        "code": this.code
      }),
      new RequestOptions({headers: header}))
      .subscribe(res => {
        console.log("result",res);
        this.tokenService.save(res.headers.get("Authorization").split(" ")[1]);
        var result=JSON.parse(res["_body"]);
        // var result=res["data"]["id"];
        if (this.socialType == "WECHAT") {
          localStorage.setItem("socialIdNew", this.userData.openid);
          localStorage.setItem("phoneTemp", this.phoneNumber);
          this.navCtrl.push(SignUpProfilePage, {
            resultData:result.data.id,
            Authorization: res.headers.get("Authorization"),
            socialType: "WECHAT",
            userData: this.userData,
            password: this.password, phoneNumber: this.phoneNumber
          });
        } else {
          localStorage.setItem("socialIdNew", this.userData.idstr);
          localStorage.setItem("phoneTemp", this.phoneNumber);
          this.navCtrl.push(SignUpProfilePage, {
            resultData:result.data.id,
            Authorization: res.headers.get("Authorization"),
            socialType: "WEIBO",
            userData: this.userData,
            password: this.password, phoneNumber: this.phoneNumber
          });
        }

      }, (err) => {
        Util.showSimpleToastOnTop(err._body, this.toastCtrl);
      });
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
      SignUpSocialUserPage
      this.sendCodeButtonText = second + "秒";
    }, 1 * 1000);

    setTimeout(() => {
      clearInterval(intervalId);
      this.sendCodeButtonText = "重新发送";
      this.sendCodeButtonIsDisabled = false;
    }, sendIntervalTime * 1000);

    // this.userService.verifyPhoneNumber(this.phoneNumber,this.password)
    //   .subscribe(res => {
    //     Util.showSimpleToastOnTop(res.data, this.toastCtrl);
    //   });

    this.userService.verifyPhoneNumber(this.phoneNumber, this.password)
      .subscribe((response: any) => {
        Util.showSimpleToastOnTop(response.data, this.toastCtrl);
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
    this.userService.getUserData()
      .subscribe(res => {
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
        } else {
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
        this.appCtrl.getRootNavs()[0].setRoot(InitialPage);
      });
  }


}
