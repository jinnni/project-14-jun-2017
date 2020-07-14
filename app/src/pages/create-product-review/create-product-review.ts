import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform } from 'ionic-angular';
import {ProductWriteReviewPage} from "../product-review/product-write-review/product-write-review";
import {HttpService} from "../../services/httpService";
import { SettingsProvider } from '../../providers/settingsProvider';

/**
 * Generated class for the CreateProductReviewPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-product-review',
  templateUrl: 'create-product-review.html',
})
export class CreateProductReviewPage {
  rating:any;
  productId:any;
  from:any;
  badgeId:any;
  challengeId:any;
  content:any;
  images:any;
  reviewId:any;
  product:any;
  initial:boolean = false;
  imageUrl:any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private UserService:HttpService,
    private settingsProvider:SettingsProvider) {
    this.productId = navParams.get('productId');
    this.from = navParams.get('from');
    this.badgeId = navParams.get('badgeId');
    this.challengeId = navParams.get('challengeId');
    this.rating = navParams.get('rating');
    this.content = navParams.get('reviewContent');
    this.images = navParams.get('images');
    this.reviewId = navParams.get('reviewId');
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.UserService.GetProductByID(this.productId).subscribe(res=>{
      this.product = res.data;
      this.initial = true;
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
  }
  goToWritePage()
  {
    if(this.reviewId == null) {
      if (this.from == "challenge") {
        this.navCtrl.push(ProductWriteReviewPage, {
          productId: this.productId,
          from: this.from,
          badgeId: this.badgeId,
          challengeId: this.challengeId,
          rating: this.rating,
          reviewId:this.reviewId
        });
      } else {
        this.navCtrl.push(ProductWriteReviewPage, {
          productId: this.productId,
          from: this.from,
          badgeId: this.badgeId,
          rating: this.rating,
          reviewId:this.reviewId
        });
      }
    }
    else{
      this.navCtrl.push(ProductWriteReviewPage,{
        reviewId:this.reviewId,
        productId:this.productId,
        reviewContent:this.content,
        images:this.images,
        rating:this.rating
      });
    }
  }
}
