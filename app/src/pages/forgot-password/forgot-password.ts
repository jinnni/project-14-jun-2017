import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController, Platform, App } from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {Util} from "../../global/util";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage()
@Component({
  selector: 'page-forgot-password',
  templateUrl: 'forgot-password.html',
})
export class ForgotPasswordPage {
  sendCodeButtonText= "校验";
  hasCode = false;
  code:string;
  phoneNumber:string;
  newPasswod:string;
  confPassword:string;
  constructor(public navCtrl: NavController,
              public appCtrl: App,
              public navParams: NavParams,
              public platform: Platform,
              private settingsProvider: SettingsProvider,
              public httpService:HttpService,
              private toastCtrl:ToastController) {
  }
  ionViewWillLeave(){
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
  ionViewDidLoad() {
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl);
  }
  sendVarifyCode(){

    if (!this.validatePhoneNumber()) {
      Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
      return;
    }
    this.httpService.verifyUser(this.phoneNumber)
      .subscribe(res =>{
          Util.showSimpleToastOnTop("短信发送成功！请在五分钟内完成验证", this.toastCtrl);
          this.hasCode = true;
      });
  }
  validatePhoneNumber() {
    return (this.phoneNumber != null) &&
      (!!this.phoneNumber.match("^[0-9]{11}$"));
  }
  changePassword(){
    if (this.code == null) {
      Util.showSimpleToastOnTop("请输入验证码", this.toastCtrl);
      return;
    }else if (this.newPasswod == null) {
      Util.showSimpleToastOnTop("请输入新密码", this.toastCtrl);
      return;
    }else if (this.confPassword == null) {
      Util.showSimpleToastOnTop("请输入确认密码", this.toastCtrl);
      return;
    }else if(this.confirmPassword()){
      Util.showSimpleToastOnTop("确认密码不匹配", this.toastCtrl);
      return;
    }else{
      this.httpService.forgotUserPassword(this.phoneNumber,this.newPasswod,this.code)
        .subscribe(res =>{
          Util.showSimpleToastOnTop("密码修改成功", this.toastCtrl);
          this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
        });
    }
  }
  confirmPassword(){
    return (this.newPasswod != this.confPassword)
  }
}
