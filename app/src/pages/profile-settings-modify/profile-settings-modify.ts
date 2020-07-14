import {Component} from '@angular/core';
import {NavController, NavParams,ToastController, Platform} from "ionic-angular";
import {UserService} from "../../services/userService";
import {Util} from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
@Component({
  selector: 'page-profile-settings-modify',
  templateUrl: 'profile-settings-modify.html',
})
export class ProfileSettingsModifyPage {
  userData:any;
  chosenLayout;
  type: string;
  inputs = {};
  title:string;
  content:string;
  user_email:string;
  constructor(public navParams: NavParams,
              public navCtrl: NavController,
              public platform: Platform,
              private userService: UserService,
              private toastCtrl: ToastController,
              private settingsProvider:SettingsProvider) {
    this.type = navParams.data;
    this.userData =JSON.parse(localStorage.getItem("UserData"));
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
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
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
  ngOnInit(){
    let layoutData = {
      nickname: {
        sectionHeader: "更改用戶名",
        image: "assets/img/icons/settings_personal.png",
        items: [{
          type: "normal_text",
          inputId: 15,
          text: localStorage.getItem("UserData.nickname"),
          isLastItemOfSection: true
        }, {
          type: "normal_input",
          inputId: 1,
          placeholder: "请输入新昵称",
          isLastItemOfSection: true
        }]
      },
      phoneNumber: {
        sectionHeader: "修改手机号",
        image: "assets/img/icons/settings_phone.png",
        items: [{
          type: "normal_text",
          text: localStorage.getItem("UserData.phoneNumber"),
          inputId: 11,
          isLastItemOfSection: true
        }, {
          type: "button_input",
          inputId: 2,
          placeholder: "请输入新手机号",
          buttonText: "发送验证码",
          buttonTextExtra: ""
        }, {
          type: "button_input",
          inputId: 3,
          placeholder: "请输入验证码",
          buttonText: "验证",
          isLastItemOfSection: true
        }]
      },
      password: {
        sectionHeader: "修改密码",
        image: "assets/img/icons/settings_password.png",
        items: [{
          type: "normal_input",
          inputId: 4,
          placeholder: "请输入原密码",
          isLastItemOfSection: true
        }, {
          type: "normal_input",
          inputId: 5,
          placeholder: "请输入新密码"
        }, {
          type: "normal_input",
          inputId: 6,
          placeholder: "重复输入新密码",
          isLastItemOfSection: true
        }]
      },
      email: {
        sectionHeader: "修改邮箱",
        image: "assets/img/icons/settings_email.png",
        items: [ {
          type: "normal_text",
          inputId: 7,
          text: localStorage.getItem("UserData.email"),
          placeholder: "请输入新邮箱",
          isLastItemOfSection: true
        }, {
          type: "normal_input",
          inputId: 8,
          placeholder: "请输入新邮箱",
          isLastItemOfSection: true
        }]
      }
    };
    this.chosenLayout = layoutData[this.type];
  }


  save() {
    switch (this.type) {
      case "nickname":
        if(Util.isEmpty(this.inputs[1])){
          Util.showSimpleToastOnTop("请输入昵称", this.toastCtrl);
          return false;
        }else if(this.inputs[1] == this.inputs[15]){
          Util.showSimpleToastOnTop("不能更改同一用户名，请输入新的用户名！", this.toastCtrl);
          return false;
        }else{
          this.userService.postSaveNickname(this.inputs[1],this.userData.id)
            .subscribe(res =>{
              this.userData.nickname = this.inputs[1];
              localStorage.setItem("UserData.nickname",this.userData.nickname);
              Util.showSimpleToastOnTop("昵称已更改！", this.toastCtrl);
            });
        }
        break;
      case "phoneNumber":
            if(Util.isEmpty(this.inputs[2])){
              Util.showSimpleToastOnTop("请输入手机号", this.toastCtrl);
              return false;
            }else if(Util.isEmpty(this.inputs[3])){
              Util.showSimpleToastOnTop("请输入认证码", this.toastCtrl);
              return false;
            }else if (!this.validatePhoneNumber()) {
              Util.showSimpleToastOnTop("请输入有效的手机号", this.toastCtrl);
              return;
            }else if (this.inputs[2] == this.inputs[11]) {
              Util.showSimpleToastOnTop("不能更改相同号码，请输入新的号码。", this.toastCtrl);
              return;
            }
            else{
              this.userService.postSaveNewPhone(this.inputs[2],this.inputs[11],this.inputs[3],this.userData.id)
              .subscribe(res =>{
                this.userData.phoneNumber = this.inputs[2];
                localStorage.setItem("UserData.phoneNumber",this.userData.phoneNumber);
                Util.showSimpleToastOnTop("手机号已更改成功！", this.toastCtrl);
              });
            }
        break;
      case "password":
        if (!this.validatePassword()) {
          Util.showSimpleToastOnTop("密码必须由英文字母和数字组成，至少8位", this.toastCtrl);
          return;
        }else if (!this.valideNewPassword()) {
          Util.showSimpleToastOnTop("密码必须由英文字母和数字组成，至少8位", this.toastCtrl);
          return;
        }else if(this.confirmPassword()){
          Util.showSimpleToastOnTop("输入的密码不匹配，请再次确认！", this.toastCtrl);
          return;
        }else{
          this.userService.postSaveNewPassword(this.inputs[4],this.inputs[5],this.userData.id)
          .subscribe(res =>{
            Util.showSimpleToastOnTop("密码已更改成功！", this.toastCtrl);
            return;
          });
        }
        break;
      case "email":
          if(Util.isEmpty(this.inputs[8])){
            Util.showSimpleToastOnTop("请输入邮箱地址", this.toastCtrl);
            return false;
          }else if(this.inputs[7] == this.inputs[8]){
            Util.showSimpleToastOnTop("不能更改同一邮箱地址，请输入新的邮箱地址！", this.toastCtrl);
            return false;
          }else{
            this.userService.postSaveNewEmail(this.inputs[7],this.inputs[8],this.userData.id)
            .subscribe(res =>{
              this.userData.email = this.inputs[8];
              localStorage.setItem("UserData.email",this.userData.email);
              Util.showSimpleToastOnTop("邮箱已更改成功！", this.toastCtrl);
            });
          }
        break;
    }
    this.navCtrl.pop();
  }

  onButtonClicked(item) {
    switch (item.inputId) {
      // TODO: make enum
      case 2:
        if(Util.isEmpty(this.inputs[2])){
          Util.showSimpleToastOnTop("请输入新的手机号", this.toastCtrl);
          return false;
        }else if (!this.validatePhoneNumber()) {
          Util.showSimpleToastOnTop("请输入有效的手机号", this.toastCtrl);
          return;
        }else{
          this.sendVerificationCode(item);
        }
        break;
      case 3:
        Util.showSimpleToastOnTop("认证成功！", this.toastCtrl);
        break;
    }
  }

  sendVerificationCode(item) {
    const phoneNumber = this.inputs[item.inputId];
    console.log("发送验证码至手机", phoneNumber);
    if (!phoneNumber) return;
    const sendIntervalTime = 60;

    item.isDisabled = true;
    let second = sendIntervalTime;
    item.buttonText = second + "秒后";
    item.buttonTextExtra = "重新发送";

    const intervalId = setInterval(() => {
      second -= 1;
      item.buttonText = second + "秒后";
    }, 1 * 1000);

    setTimeout(() => {
      clearInterval(intervalId);
      item.buttonText = "重新发送";
      item.buttonTextExtra = "";
      item.isDisabled = false;
      console.log(item.isDisabled);
    }, sendIntervalTime * 1000);

    this.userService.postSendVarificationCode(phoneNumber)
      .subscribe(res =>{
        Util.showSimpleToastOnTop("验证码已成功发送", this.toastCtrl);
      });

  }

  validatePassword() {
    return (this.inputs[5] != null) &&
      (!!this.inputs[5].match("^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$"));
  }
  valideNewPassword(){
    return (this.inputs[6] != null) &&
      (!!this.inputs[6].match("^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$"));
  }
  confirmPassword(){
    return (this.inputs[5] != this.inputs[6])
  }
  validateEmail(){
    return (!!this.inputs[8].match("/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/"));
  }
  validatePhoneNumber() {
    return (this.inputs[2] != null) &&
      (!!this.inputs[2].match("^[0-9]{11}$"));
  }

}
