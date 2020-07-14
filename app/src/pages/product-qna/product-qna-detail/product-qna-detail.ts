import {Component} from '@angular/core';
import {NavParams,ViewController,NavController, Platform, App, AlertController, ToastController} from 'ionic-angular';
import {QnaItemType} from "../../../global/qnaItemType";
import {GlobalVariable} from "../../../global/global.variable";
import {HttpService} from "../../../services/httpService";
import { Util } from "../../../global/util";
import {SignInUpPage} from "../../sign-in-up/sign-in-up";
import { SettingsProvider } from '../../../providers/settingsProvider';
@Component({
  selector: 'page-product-qna-detail',
  templateUrl: 'product-qna-detail.html'
})
export class ProductQnaDetailPage {

  QnaItemType = QnaItemType;
  replyfocus = false;
  type: string;
  qnaData: any;
  productName: string;
  dummyProdId:number;
  answerList: any; // can be either Answer or Athis.answerList = this.qnaData.answers;nswerComment
  replyInputContent: string ='';
  userData: any;
  isWriting:boolean = true;
  constructor(private navCtrl: NavController,public appCtrl: App,
              public navParams: NavParams,
              public platform: Platform,
              private toastCtrl: ToastController,
              private settingsProvider:SettingsProvider,
              private alertCtrl: AlertController,
              public httpService:HttpService,
              private viewCtrl: ViewController) {
    this.type = navParams.get('type');
    this.qnaData = navParams.get('qnaData');
    this.productName = navParams.get('productName');
    this.dummyProdId = this.qnaData.productId;
    if (this.type == QnaItemType.QUESTION_DETAIL) {
      this.getAnswerListByQuestionId(this.qnaData.id);
      //this.answerList = this.qnaData.answers;
    }
    else if (this.type == QnaItemType.ANSWER_DETAIL) {
      //this.answerList = qnaService.getAnswerCommentListByAnswerId(this.qnaData.id);
      this.answerList = this.qnaData.answers;
    }
    this.userData =JSON.parse(localStorage.getItem("UserData"));
  }
  giveAnswer(){
    if(this.settingsProvider.userStatus.productDetailAnswer){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      if(this.replyInputContent)
      {
        this.postAnswerForQue(this.replyInputContent,this.qnaData.id,this.userData.id)
        .subscribe(res =>{
          this.navCtrl.remove(this.viewCtrl.index);
        });
      }else{
          this.alertCtrl.create({
            title: "",
            message: "请回复！",
            cssClass: 'okcancel',
            buttons: ["确定"]
        }).present();
      }
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
    Util.unRegisterBackButton(this.platform,this.navCtrl);
  }
  postAnswerForQue(content: string,questionId: number,userId: number){
    return this.httpService
      .post("/answer",  {
        "content": content,
        "questionId": questionId,
        "userId": userId,
      }, true);
  }
  getAnswerListByQuestionId(id:number){
    this.httpService.GetAnswerListByQuestionId(id).subscribe(res =>{
      this.answerList = res;
    });
  }

}
