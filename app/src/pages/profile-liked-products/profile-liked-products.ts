import {Component, ViewChild} from '@angular/core';
import {Content, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {Product} from "../../data/product.interface";
import {ProductDetailPage} from "../product-detail/product-detail";
import {HttpService} from "../../services/httpService";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';



@IonicPage({
  segment: "profile/liked/products/:userId"
})
@Component({
  selector: 'page-profile-liked-products',
  templateUrl: 'profile-liked-products.html',
})
export class ProfileLikedProductsPage {

  @ViewChild(Content) content: Content;

  pageTitle: string;
  imageUrl: string;
  likedProducts:any=[];
  initial:any;
  isScroll:boolean;
  lastPage:boolean;

  constructor(private navCtrl: NavController,
              public navParams: NavParams,public UserService:HttpService,
              public platform: Platform,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.UserService.toggleLoader("ugc-loader",true);
    const title = navParams.get("title");
    this.pageTitle = !!title ? title : "关注的产品";
    this.imageUrl = localStorage.getItem("myImageUrl");
  }
  ionViewDidEnter(){
    let userId = Number(this.navParams.get("userId"));
    this.LoadSubCat(userId);
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
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }

  showProduct(product: Product) {
    this.navCtrl.push(ProductDetailPage, {item: product});
  }

  LoadSubCat(userId:number){
    this.UserService.GetProductsLikeByUser(userId).subscribe(res =>{
      this.likedProducts = [];
      if(res.length == 0){
        this.lastPage = true;
        this.UserService.getAllImagesWithClassname("ugc-loader",'');
        return;
      }
      this.likedProducts = res;
      this.UserService.GetProductPartnerList().subscribe(res => {
        for (let item of this.likedProducts)
        {
          if (item.likeCount > 99999) item.likeCount = this.getCountStyle(item.likeCount.toString());
          if (item.reviewCount > 99999) item.reviewCount = this.getCountStyle(item.reviewCount.toString());
          let date = item.createdOn.split("T")[0];
          let time = item.createdOn.split("T")[1].split(".")[0];
          let timeStamp = Number(date.split("-")[0])*3600*24*365+Number(date.split("-")[1])*3600*24*30+Number(date.split("-")[2])*3600*24+Number(time.split(":")[0])*3600+Number(time.split(":")[1])*60+Number(time.split(":")[2]);
          item.timeStamp = timeStamp;
          item.liked = true;
          for(var productPartner of res)
          {
            if(productPartner.productId.toString()==item.id.toString())
            {
              item.productPrice=Number(productPartner.productPrice);
              break;
            }
          }
          if(item.productPrice == null) item.productPrice = 0;
        }
        this.likedProducts.sort (function (a, b) {
          return (b.timeStamp-a.timeStamp);
        });
        this.initial = true;
        this.lastPage = true;
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-profile-liked-products');
      },error =>{
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-profile-liked-products');
      });
    });

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

  scrollHandler(event) {
    if(event.scrollTop > 700){
      this.isScroll = true;
    }else{
      this.isScroll = false;
    }
  }
  scrollTop(){
    this.content.scrollToTop(1200);
    this.isScroll = false;
  }



}
