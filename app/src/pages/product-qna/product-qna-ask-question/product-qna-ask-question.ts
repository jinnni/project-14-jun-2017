import {Component} from '@angular/core';
import {NavController,NavParams,ToastController,ViewController, Platform} from 'ionic-angular';
import {ProductService} from "../../../services/productService";
import {Util} from "../../../global/util";
import { SettingsProvider } from '../../../providers/settingsProvider';
@Component({
  selector: 'page-product-qna-ask-question',
  templateUrl: 'product-qna-ask-question.html'
})
export class ProductQnaAskQuestionPage {

  productName: string;
  review_question: string;
  productId:number;
  userData:any;
  constructor(public navCtrl: NavController,
              private toastCtrl: ToastController,
              private productService:ProductService,
              private settingsProvider:SettingsProvider,
              public navParams: NavParams,
              public platform: Platform,
              private viewCtrl: ViewController) {
                 this.productId = navParams.get('productId');
                 this.productName = navParams.get('productName');
                 this.userData =JSON.parse(localStorage.getItem("UserData"));

  }

  publish() {
    if (this.review_question == null  ) {
      Util.showSimpleToastOnTop("请提问！", this.toastCtrl);
      return;
    }

    this.productService.addReviewQuestion("<pre>"+this.review_question+"</pre>",this.productId,this.userData.id)
      .subscribe(res =>{
        this.navCtrl.remove(this.viewCtrl.index);
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
