import moment from "moment";
import {Platform, ToastController, NavController, AlertController} from "ionic-angular";
import {SignInUpPage} from "../pages/sign-in-up/sign-in-up";
import {GlobalVariable} from "./global.variable";
import { Clipboard } from "@ionic-native/clipboard";
import { ENV } from '@app/env';
declare let Wechat:any;
declare let WeiboSDK:any;
export class Util {
  static chineseLocale = "zh-cn";
  static alertCtrl: AlertController;
  static platform: Platform;
  static getRelativeTime(date: Date) {
    return moment(date).locale(Util.chineseLocale).diff(new Date(),'days');
  }

  static formatTimeYearMonthDay(date: Date) {
    return moment(date).format('YYYY-MM-DD');
  }
  
  static wechatShare(detailData,resPath,imageUrl,type){
    console.log("@wechatShare")
    switch (type) {
      case 'session':
        Wechat.share({
          message: {
            title: detailData.title,
            description: detailData.content,
            thumb: imageUrl + detailData.imageArray[0],
            media: {
              type: Wechat.Type.LINK,
              webpageUrl: ENV.webpageUrl + resPath.path
            }
          },
          scene: Wechat.Scene.SESSION
        }, function () {
          this.alertCtrl.create({
            title: "",
            message: "帖子已分享给好友！",
            cssClass: 'okcancel',
            buttons: ["确定"]
          }).present();
        }, function (reason) {
          this.alertCtrl.create({
            title: "",
            message: reason,
            cssClass: 'okcancel',
            buttons: ["确定"]
          }).present();
        });
        break;
    case 'timeline':
        Wechat.share({
          message: {
            title: detailData.title,
            description: detailData.content,
            thumb: imageUrl + detailData.imageArray[0],
            media: {
              type: Wechat.Type.LINK,
              webpageUrl: ENV.webpageUrl + resPath.path
            }
          },
          scene: Wechat.Scene.TIMELINE
        }, function () {
          this.alertCtrl.create({
            title: "",
            message: "帖子已分享给好友！",
            cssClass: 'okcancel',
            buttons: ["确定"]
        }).present();
        }, function (reason) {
          this.alertCtrl.create({
            title: "",
            message: reason,
            cssClass: 'okcancel',
            buttons: ["确定"]
        }).present();
        });
        break;
      case 'weibo':
          let args :any = {};
          args.url = ENV.webpageUrl + resPath.path.replace("//", "/");
          args.title = detailData.title;
          let length = detailData.content.length >= 150? 150: detailData.content.length;
          args.description = detailData.content.substr(0,length) + " " + args.url + " @评价达人网";
          args.image = imageUrl + detailData.imageArray[0] + "?x-oss-process=image/resize,p_30";
          console.log("args", args);
          WeiboSDK.shareToWeibo(function () {
            console.log("Share success")
            this.alertCtrl.create({
              title: "",
              message: "帖子已分享给好友！",
              cssClass: 'okcancel',
              buttons: ["确定"]
            }).present();
          }, function (failReason) {
            WeiboSDK.ssoLogin(function (args) {
              console.log("Weibo Login Res : ", args);
              this.alertCtrl.create({
                title: "",
                message: failReason,
                cssClass: 'okcancel',
                buttons: ["确定"]
              }).present();
            }, function (failReason) {
              console.log("cancel by :", failReason);
            });
          }, args);
        break;
      default:
        break;
    }
  }
  static formatTimeFacebookStyle(date: Date) {

    const reference = moment(date);
    const now = moment(new Date());
    const yesterday = now.clone()
      .subtract(1, "days")
      .startOf("day");

    const diffDuration = moment.duration(reference.diff(now));

    // if the time is within 24 hours
    const diffHours = Math.abs(diffDuration.asHours());
    if (diffHours < 24) {
      return Math.floor(diffHours) + "小时前";
    }

    // -> add date time
    // if the time was yesterday
    if (reference.isSame(yesterday, 'day')) {
      return reference.format('昨天 HH:mm');
    }

    // if the time is within this year
    if (reference.isSame(now, 'year')) {
      return reference.format('M月 D日 HH:mm');
    }

    // if it's before last year
    return reference.format('YYYY年 M月 D日 HH:mm');
  }

  static showSimpleToastOnTop(message: string, toastCtrl: ToastController) {
    let toast = toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.present();
  }

    static showSimpleToastOnBottom(message: string, toastCtrl: ToastController) {
      let toast = toastCtrl.create({
        message: message,
        duration: 1000,
        position: 'bottom'
      });

      toast.present();
    }

  static isSucess(res) {
    return res.state == "SUCCESS";
  }

  static isError(res) {
    return res.state == "ERROR";
  }

  static isEmpty(text) {
    return text == null || text == '';
  }
  static hasUserAccess(navCtrl:NavController)
  {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      navCtrl.setRoot(SignInUpPage);
      return false;
    }else{
      return true;
    }
  }

  static getHasFormFilled(){
    if( localStorage.getItem("normalFormFilled") === 'true' ){
      return 'normal';
    }else if( localStorage.getItem("wechatFormFilled") === 'true' ){
      return 'wechat';
    }else if( localStorage.getItem("weiboFormFilled") === 'true' ){
      return 'weibo';
    }
  }

  static setHasFormFilled(loginType:string)
  {

    localStorage.setItem("normalFormFilled","false");
    localStorage.setItem("wechatFormFilled","false");
    localStorage.setItem("weiboFormFilled","false");

    if( loginType == 'normal' ){
      localStorage.setItem("normalFormFilled","true");
    }else if( loginType == 'wechat' ){
      localStorage.setItem("wechatFormFilled","true");
    }else if( loginType == 'weibo' ){
      localStorage.setItem("weiboFormFilled","true");
    }
  }

  static registerBackButton(platform:Platform,counter:number,toastCtrl:ToastController){
    platform.registerBackButtonAction(() => {
     if (counter == 0) {
       counter++;
       let loaderElement = document.querySelector(".ugc-loader");
       loaderElement.classList.add("hide-loader");
       loaderElement.classList.remove("show-loader");
       /*Press again to exit!*/
       Util.showSimpleToastOnBottom("再按一次退出!",toastCtrl);
       setTimeout(() => { counter = 0 }, 3000)
     } else {
       platform.exitApp();
     }
   }, 0)
  }
  static unRegisterBackButton(platform:Platform,navCtrl:NavController){
    platform.registerBackButtonAction(() => {
     navCtrl.pop();
   }, 0)
  }

  static matchDate(date,dateToCompare){
    var dateStart = new Date(date);
    var dateEnd = new Date(dateToCompare);
    return dateStart >= dateEnd;
  }

}
