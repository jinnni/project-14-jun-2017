import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import {DeliveryInfoPage} from "../delivery-info/delivery-info";
import {NoticePage} from "../notice/notice";
import {Util} from "../../global/util";
@IonicPage()
@Component({
  selector: 'page-terms-condition-modal-camp',
  templateUrl: 'terms-condition-modal-camp.html',
})
export class TermsConditionModalCampPage {
  terms:string;
  answersArray:any;
  campId:any;
  agreementIsChecked: boolean;
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl : ViewController,
    public toastCtrl: ToastController) {
    this.terms = navParams.get("message")
    this.answersArray = navParams.get("answersArray")
    this.campId = navParams.get("campId")
    this.agreementIsChecked = true;
  }
  ionViewDidEnter(){
    var pushHtml = document.querySelector(".card-subtitle1");
    pushHtml.innerHTML = this.terms;
  }
  DenyTerms(){
    this.viewCtrl.dismiss();
    let currentIndex = this.navCtrl.getActive().index;
    this.navCtrl.remove(currentIndex);
  }
  AcceptTerms(){
    if(!this.agreementIsChecked) {
      Util.showSimpleToastOnTop("请同意免责声明。", this.toastCtrl);
      return;
    }else{
      this.navCtrl.push(DeliveryInfoPage,{campId:this.campId});
      this.viewCtrl.dismiss();
    }
  }
}
