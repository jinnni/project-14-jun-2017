import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Platform } from 'ionic-angular';
import {ProductDetailPage} from "../product-detail/product-detail";
import {Product} from "../../data/product.interface";
import { UgcDetailPage } from "../ugc-detail/ugc-detail";
import { HttpService } from '../../services/httpService';
import { ArticleDetailPage } from '../article-detail/article-detail';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-editor-score',
  templateUrl: 'editor-score.html',
})
export class EditorScorePage {
  @ViewChild('slide') slider: Slides;
  selectedBadgeTab: number;
  expertBadge: boolean;
  myBadge: boolean;
  userId: any;
  productReviews: any;
  ugcs: any;
  reviewArray = [];
  ugcArray = [];
  imageUrl: any;
  pageNo1:number = 0;
  pageNo2:number = 0;
  totpageProduct;
  totpageUgc;
  pageTabs: any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private httpService: HttpService,
    private settingsProvider:SettingsProvider) {
    this.userId = navParams.get("userId");
    this.myBadge = true;
    this.pageTabs = "tab0";
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.selectedBadgeTab = 2;
    this.expertBadge = false;
    this.myBadge = true;
    this.getEditorScore();
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
  showProduct(productItem: Product) {
    this.navCtrl.push(ProductDetailPage, {item:productItem});
  }
  GoDetail(item, id, status) {
    this.navCtrl.push(UgcDetailPage, {
      item: item,
      id: id,
      status: status
    });
  }
  gotoNextArticle(id, status,item) {
    this.navCtrl.push(ArticleDetailPage, {item: item,id: id,status: status});
  }
  getEditorScore(){
    this.httpService.GetEditorScore_2_Pageable(this.userId,this.pageNo2,8).subscribe(res => {
      if(res.content.length > 0){
        this.totpageUgc = res.totalPages - 1;
      }else{
        this.totpageUgc = res.totalPages;
      }
      this.ugcs = res.content;
      for (let index = 0; index < this.ugcs.length; index++) {
        if (Number(this.ugcs[index].likeCount) > 99999) this.ugcs[index].likeCount = this.getCountStyle(this.ugcs[index].likeCount.toString());
        this.ugcs[index].createComment = {postComment:''}
        this.ugcArray.push(this.ugcs[index]);
      }
    });
    this.httpService.GetEditorScore_1_Pageable(this.userId,this.pageNo1,8).subscribe(res => {
      if(res.content.length > 0){
        this.totpageProduct = res.totalPages - 1;
      }else{
        this.totpageProduct = res.totalPages;
      }
      this.productReviews = res.content;
      for (let index = 0; index < this.productReviews.length; index++) {
        this.productReviews[index].productDetails.reviewLikeCount = this.productReviews[index].likes;
        if (Number(this.productReviews[index].productDetails.reviewLikeCount) > 99999) this.productReviews[index].productDetails.reviewLikeCount = this.getCountStyle(this.productReviews[index].productDetails.reviewLikeCount.toString());
        
        this.reviewArray.push(this.productReviews[index].productDetails);
      }
    });
  }
  doInfinite1(infiniteScroll) {
    this.pageNo1 = this.pageNo1 + 1;
    this.httpService.GetEditorScore_1_Pageable(this.userId,this.pageNo1,8).subscribe(res => {
      this.productReviews = res.content;
      for (let index = 0; index < this.productReviews.length; index++) {
        this.productReviews[index].productDetails.reviewLikeCount = this.productReviews[index].likes;
        this.reviewArray.push(this.productReviews[index].productDetails);
      }
    });
    infiniteScroll.complete();
  }
  doInfinite2(infiniteScroll) {
    this.pageNo2 = this.pageNo2 + 1;
    this.httpService.GetEditorScore_2_Pageable(this.userId,this.pageNo2,8).subscribe(res => {
      this.ugcs = res.content;
      for (let index = 0; index < this.ugcs.length; index++) {
        this.ugcArray.push(this.ugcs[index]);
      }
    });
    infiniteScroll.complete();
  }
  selectedTab(index) {
    this.expertBadge =false;
    this.myBadge = false;
    this.slider.lockSwipes(false);
    this.slider.slideTo(index);
    this.slider.lockSwipes(true);
    this.selectedBadgeTab = index;
    if (index == 1) {
      this.expertBadge = true;
    }
    if (index == 0) {
      this.myBadge = true;
    }
  }
  getCountStyle(count:any)
  {
    if(Number(count)<1000000){
      let countText = (Number(count)/1000 | 0) + 'k';
      return countText;
    }
    else{
      let countText = (Number(count)/1000000).toString();
      if(countText.indexOf('.') !== -1)
      {
        countText = countText.substr(0, countText.indexOf('.')+2) + 'M';
      } else {
        countText = countText.length > 3 ? countText.substring(0,3) : countText + 'M';
      }
      return countText;
    }
  }
}
