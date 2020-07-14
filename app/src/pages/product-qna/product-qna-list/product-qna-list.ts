import {Component} from '@angular/core';
import {NavController, NavParams, Platform} from 'ionic-angular';
import {Question} from "../../../data/question.interface";
import {Product} from "../../../data/product.interface";
import {QnaItemType} from "../../../global/qnaItemType";
import {HttpService} from "../../../services/httpService";
import { Util } from "../../../global/util";
import { SettingsProvider } from '../../../providers/settingsProvider';
@Component({
  selector: 'page-product-qna-list',
  templateUrl: 'product-qna-list.html'
})
export class ProductQnaListPage {

  QnaItemType = QnaItemType;

  product: Product;
  questionList: Question[];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              public  UserService:HttpService,
              private settingsProvider:SettingsProvider) {
    this.product = navParams.data;
    //this.questionList = this.qnaService.getQuestionsListByProductId(this.product.id);
    this.GetQuestionProduct(this.product.id);
  }
  GetQuestionProduct(productId:number){
    this.UserService.GetQuestionProductById(productId).subscribe(res =>{
      this.questionList = res;
    });
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

}
