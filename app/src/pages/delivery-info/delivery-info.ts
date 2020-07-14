import {Component} from '@angular/core';
import {IonicPage, NavController,  AlertController, NavParams, Platform, App, ToastController} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {GlobalVariable} from "../../global/global.variable";
import { Util } from "../../global/util";
import { SignInUpPage } from '../../pages/sign-in-up/sign-in-up';
import { UserService } from '../../services/userService';
import {AppSettings} from "../../app/app.settings";
import { Headers, Http, RequestOptions } from '@angular/http';
import { StorageService } from '../../services/storageService';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage({
  name: "DeliveryInfo",
  segment: "deliveryInfo"
})
@Component({
  selector: 'page-delivery-info',
  templateUrl: 'delivery-info.html',
})
export class DeliveryInfoPage {
  formData;
  provinces: any;
  selectedProvince: any;
  selectedCity: any;
  selectedArea: any;
  sendCodeButtonText = "发送验证码";
  sendCodeButtonIsDisabled = false;
  recipient: string;
  phoneNumber: string;
  detailAddress: string=' ';
  campId: number;
  giftId: number;
  giftData:any;
  userDetail: any;
  reverseData:any;
  otp:boolean = true;
  code: string;
  phone:any;
  disabled = false;message;
  otpSent = false;
  addressfocus=false;
  country="";
  from:any = 'none';
  quickTryMessage = false;
  quickTryMessage1 = false;
  quickTryCheck = true;
  giftPoint = 0;
  userPoint = 0; // from global api
  constructor(private navCtrl: NavController,
    public toastCtrl: ToastController,
      public appCtrl: App,
      public navParams: NavParams,
      public platfrom: Platform,
      private http: Http,
      private alertCtrl: AlertController,
      private httpService:HttpService,
      private platform: Platform,
      private storageService: StorageService,
      private settingsProvider:SettingsProvider) {
    this.reverseData=[];
    this.from = navParams.get("from");
    this.message = navParams.get("message");
    this.campId = navParams.get("campId");
    this.giftId = navParams.get("campId");
    console.log(this.campId,this.giftId);
    
    this.giftPoint = Number(navParams.get("giftPoint"));
    this.userPoint = Number(navParams.get("userPoint"));
    this.userDetail = JSON.parse(localStorage.getItem("UserData"));
    this.provinces = JSON.parse(localStorage.getItem("locations"));
    if (this.userDetail.country == undefined) {
      this.country = 'china';
    } else {
      this.country = this.userDetail.country;
    }
    this.phone = this.userDetail.phoneNumber;
    // this.fillForm();
    if(this.from == "quick-try"){
      this.quickTryMessage = true;
    }
  }
  fillForm() {
    this.recipient = this.userDetail.nickname;
    this.phoneNumber = this.userDetail.phoneNumber;
    this.selectedProvince = [];
    this.selectedCity = [];
    this.selectedArea = [];
    for (let index = 0; index < this.provinces.length; index++) {
      if (this.provinces[index].name == this.userDetail.province) {
        this.selectedProvince = this.provinces[index];
        for (let index1 = 0; index1 < this.selectedProvince.cities.length; index1++) {
          if (this.selectedProvince.cities[index1].name == this.userDetail.city) {
            this.selectedCity = this.selectedProvince.cities[index1];
            for (let index2 = 0; index2 < this.selectedCity.districts.length; index2++) {
              if (this.selectedCity.districts[index2].name == this.userDetail.area) {
                this.selectedArea = this.selectedCity.districts[index2];
              }
            }
          }
        }
      }
    }
    if(localStorage.getItem("UserAddress") != undefined){
      this.detailAddress = localStorage.getItem("UserAddress");
    }else{
      this.detailAddress = "";
    }
  }
  emptyForm() {
    this.recipient = '';
    this.phoneNumber = '';
    this.selectedProvince = '';
    this.selectedCity = '';
    this.selectedArea = '';
    this.detailAddress = '';
    this.code = '';
  }
  checkName(name) {
    return name == this.userDetail.province;
  }
  ionViewDidEnter(){
    if(this.from == "quick-try-free"){
      setTimeout(() => {
        let currentIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(currentIndex);
      }, 1000);
      this.phone = this.userDetail.phoneNumber;
      this.emptyForm();
    } else {
      this.httpService.acceptTnc(this.campId + "").subscribe(res =>{
        let currentIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(currentIndex);
        this.phone = this.userDetail.phoneNumber;
        this.emptyForm();
      });
    }
  }
  onBlurValidateBlank(event){
    if(event.value.replace(/\s+/g, '').length == 0){
      event.value = "";
    }
  }
  submit_GM(){
    if (!this.recipient || !this.selectedProvince || !this.selectedCity || !this.selectedArea || !this.detailAddress || !this.phoneNumber) {
      Util.showSimpleToastOnTop("必填内容不能为空", this.toastCtrl);
      this.disabled = true;
      return;
    }
    if(this.phone == this.phoneNumber){
      let data = {
        "giftProductId": this.giftId,
        "claimingUserId": localStorage.getItem("UserData.userId"),
        "name": this.recipient,
        "phoneNumber": this.phoneNumber,
        "address": this.detailAddress,
        "districtId": this.selectedArea.id
      }
      this.httpService.ClaimGiftMarketProduct(data).subscribe(res => {
        this.quickTryMessage1 = true;
        setTimeout(() => {
          this.quickTryMessage1 = false;
          this.navCtrl.popToRoot();
        }, 2000);
      },eer=>{
        let alert = this.alertCtrl.create({
          // title: 'Information',
          message: '我们很抱歉，这款宝物就在刚才恰好强光了。呜呜~！你可以看看其他宝物哦。感谢你的参与！',
          cssClass: 'okcancel',
          buttons: [{
              text: '确定',
              handler: () => {this.navCtrl.popToRoot();}
            }]
          });
          alert.present();
      });
    }else{
      if (!this.validatePhoneNumber()) {
        Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
        this.phoneNumber = "";
        return;
      }
      if(this.otp == true){
        this.otp=false;
      }
      this.giftData = {
        "giftProductId": this.giftId,
        "claimingUserId": localStorage.getItem("UserData.userId"),
        "name": this.recipient,
        "phoneNumber": this.phoneNumber,
        "address": this.detailAddress,
        "districtId": this.selectedArea.id
      }
      this.changePhoneNumber_GM(this.phoneNumber)
    }
  }
  submit() {
    if (!this.recipient || !this.selectedProvince || !this.selectedCity || !this.selectedArea || !this.detailAddress || !this.phoneNumber) {
      Util.showSimpleToastOnTop("必填内容不能为空", this.toastCtrl);
      this.disabled = true;
      return;
    }
    if(this.phone == this.phoneNumber){
      this.formData = {
        "userId": localStorage.getItem("UserData.userId"),
        "name": this.recipient,
        "address": this.detailAddress,
        "phoneNumber": this.phoneNumber,
        "city": this.selectedCity.name,
        "districtId": this.selectedArea.id,
        "province": this.selectedProvince.name,
        "country": this.country
      };
      console.log("id",this.campId );
      this.httpService.AddPreSurveyMemberDetail(this.formData,this.campId,this.from).subscribe(res => {
        console.log("AddPreSurveyMemberDetail",this.formData );
        
        if(this.from == "quick-try-free"){
          this.quickTryMessage1 = true;
          setTimeout(() => {
            this.quickTryMessage1 = false;
            this.navCtrl.popToRoot();
          }, 2000);
        }else{
          this.presentAlert(true);
        }
      },error=>{
        if(this.from == "quick-try-free"){
          Util.showSimpleToastOnTop('Sorry! campaign ended.', this.toastCtrl);
          this.navCtrl.popToRoot();
        }else{
          Util.showSimpleToastOnTop('必填内容不能为空', this.toastCtrl);
        }
      });
    }else{
      if (!this.validatePhoneNumber()) {
        Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
        this.phoneNumber = "";
        return;
      }
      if(this.otp == true){
        this.otp=false;
      }
      this.formData = {
        "userId": localStorage.getItem("UserData.userId"),
        "name": this.recipient,
        "address": this.detailAddress,
        "phoneNumber": this.phone,
        "city": this.selectedCity.name,
        "districtId": this.selectedArea.id,
        "province": this.selectedProvince.name,
        "country": this.country
      };
      this.changePhoneNumber(this.phoneNumber)
    }
  }
  changePhoneNumber_GM(newPhone) {
    if(this.otpSent == true){
      if (this.code == null || this.code.trim().length == 0) {
        Util.showSimpleToastOnTop("请正确输入验证码！", this.toastCtrl);
        return;
      }
      let data = {
        "newPhoneNumber": newPhone,
        "oldPhoneNumber": localStorage.getItem("UserData.phoneNumber"),
        "code": this.code
      }
      this.httpService.changePhoneNumber(UserService.basePath + "/" + localStorage.getItem("UserData.userId") + "/change-phone", data).subscribe(res =>{
        this.httpService.ClaimGiftMarketProduct(this.giftData).subscribe(res => {
          this.quickTryMessage1 = true;
          setTimeout(() => {
            this.quickTryMessage1 = false;
            this.storageService.clearAll();
          }, 2000);
        },error=>{
          let alert = this.alertCtrl.create({
          // title: 'Information',
          message: '我们很抱歉，这款宝物就在刚才恰好强光了。呜呜~！你可以看看其他宝物哦。感谢你的参与！',
          cssClass: 'okcancel',
          buttons: [{
              text: '确定',
              handler: () => {this.navCtrl.popToRoot();}
            }]
          });
          alert.present();
        });
      },err=>{
        console.log("error",err);
        Util.showSimpleToastOnTop("请正确输入验证码！", this.toastCtrl);
      });
    }
  }
  changePhoneNumber(newPhone) {
    if(this.otpSent == true){
      if (this.code == null || this.code.trim().length == 0) {
        Util.showSimpleToastOnTop("请正确输入验证码！", this.toastCtrl);
        return;
      }
      let data = {
        "newPhoneNumber": newPhone,
        "oldPhoneNumber": localStorage.getItem("UserData.phoneNumber"),
        "code": this.code
      }
      this.httpService.changePhoneNumber(UserService.basePath + "/" + localStorage.getItem("UserData.userId") + "/change-phone", data).subscribe(res =>{
        this.httpService.AddPreSurveyMemberDetail(this.formData,this.campId,this.from).subscribe(res => {
          if(this.from == "quick-try-free"){
            this.quickTryMessage1 = true;
            setTimeout(() => {
              this.quickTryMessage1 = false;
              this.storageService.clearAll();
            }, 2000);
          }else{
            this.presentAlert(false);
          }
        },error=>{
          if(this.from == "quick-try-free"){
            Util.showSimpleToastOnTop('你已经提交一次申请了哦，请不要着急，活动结束后我们会立即通知你哒。', this.toastCtrl);
            this.navCtrl.popToRoot();
          }else{
            Util.showSimpleToastOnTop('必填内容不能为空', this.toastCtrl);
          }
        });
      },err=>{
        console.log("error",err);
        Util.showSimpleToastOnTop("请正确输入验证码！", this.toastCtrl);
      });
    }
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
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platfrom,this.navCtrl)
  }
  presentAlert(type) {
    let alert = this.alertCtrl.create({
      title: '恭喜恭喜，已完成启动！',
      message: '如最终被选的话你即将还会收到通知，感谢您的配合',
      cssClass: 'okcancel',
      buttons: [{
        text: '确认',
        handler: () => {
          this.httpService.DeleteMessageById(this.message).subscribe(res =>{
            if(type == true){
              this.navCtrl.popToRoot();
              this.navCtrl.parent.select(4);
            }else{
              this.storageService.clearAll();
            }
          });
        }
      }]
    });
    alert.present();
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

  validUserExists(){
    this.httpService.accountStatus(this.phoneNumber)
    .subscribe((response: any) => {
      console.log("validUserExists: " + JSON.stringify(response))
      if(response.status){
        this.httpService.phoneCheck(this.phoneNumber)
        .subscribe((response: any) => {
          console.log(response);
          if(response.status == false){
            if(response.code === 2) {
              //  此手机号已注册过！
              // this.alertbox(response.message);
              this.alertbox("此手机号已注册过！");
            }
            if(response.code === 0) {
              this.sendVerificationCode();
            }
            return;
          }
          if(response.status){
            if(response.code === 1) {
              this.alertbox("你已有有效的验证码，请确认后输入正确的验证码！或等5分钟后重新获取新验证码，谢谢！");
            }
            else {
              this.alertbox("你已经注册了！不需要重新注册哦！");
              this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
            }
          }
        })
      }else{
        // User with phone account already in use
        this.alertbox(" 此手机号已注册过！");
      }
    })
    
  }

  validatePhoneNumber() {
    let x = this.phoneNumber+'';
    return (x!= null) &&
      (!!x.match("^[0-9]{11}$"));
  }
  sendVerificationCode() {
    if (this.sendCodeButtonIsDisabled) return;
    if (!this.validatePhoneNumber()) {
      Util.showSimpleToastOnTop("请正确输入手机号！", this.toastCtrl);
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

    const header = new Headers();
    header.set("Content-Type", "application/json");
    header.set(HttpService.SERVER_HEADER_TOKEN_KEY, "Bearer " + GlobalVariable.token);
    this.http.put(AppSettings.BASE_URL+UserService.basePath+"/send-verification-code", JSON.stringify({
      "newPhoneNumber": this.phoneNumber,
    }),
    new RequestOptions({headers: header}))
    .subscribe(res => {
      Util.showSimpleToastOnTop("短信发送成功！请在五分钟内完成验证。", this.toastCtrl);
      this.otpSent = true;
    }, (err) => {
      Util.showSimpleToastOnTop(err._body, this.toastCtrl);
    });
  }
  accept(){
    this.quickTryMessage = !this.quickTryMessage;
  }
  deny(){
    this.quickTryMessage = !this.quickTryMessage;
    this.navCtrl.popToRoot();
  }
}
