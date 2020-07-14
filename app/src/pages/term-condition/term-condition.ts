import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, Platform } from 'ionic-angular';
import {DeliveryInfoPage} from "../delivery-info/delivery-info";
import {Util} from "../../global/util";
import { HttpService } from '../../services/httpService';
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage()
@Component({
  selector: 'page-term-condition',
  templateUrl: 'term-condition.html',
})
export class TermConditionPage {
  terms:string;
  answersArray:any;
  campId:any;
  agreementIsChecked: boolean;
  message;
  formData;
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private httpService:HttpService,
     public alertCtrl: AlertController,
     public toastCtrl: ToastController,
     private platform:Platform,
     private settingsProvider:SettingsProvider) {
      let data = navParams.get("data");
      this.terms = data.message;
      this.answersArray = data.answersArray;
      this.campId = data.campId;
    this.agreementIsChecked = true;
    this.message = navParams.get("message");
    this.formData = {
      "userId": localStorage.getItem("UserData.userId"),
      "name": "",
      "address": "",
      "phoneNumber": "",
      "city": "",
      "district": "",
      "province": "",
      "country": ""
    };
    this.httpService.AddPreSurveyMemberDetail(this.formData,this.campId,"").subscribe((res=>{
      // this.presentAlert()
  }));
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
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    let currentIndex = this.navCtrl.getActive().index - 1;
    this.navCtrl.remove(currentIndex);
    var pushHtml = document.querySelector(".card-subtitle1");
    pushHtml.innerHTML = this.terms;
  }
  DenyTerms(){
    this.presentAlert();
    
  }
  presentAlert() {
    let alert = this.alertCtrl.create({
      title: '链接已成功提交！',
      message: '您已完成问卷，感谢您的配合！',
      buttons: [{
          text: '确定',
          handler: () => {
            this.httpService.DeleteMessageById(this.message.id).subscribe(res =>{
              this.navCtrl.popToRoot();
            this.navCtrl.parent.select(4);
            });
          }
        }]
    });
    alert.present();
    }
  AcceptTerms(){
    if(!this.agreementIsChecked) {
      Util.showSimpleToastOnTop("请同意免责声明。", this.toastCtrl);
      return;
    }else{
      this.navCtrl.push(DeliveryInfoPage,{campId:this.campId,'message':this.message});
    }
  }
}
