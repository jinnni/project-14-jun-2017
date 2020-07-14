import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { HttpService } from '../../services/httpService';
import { Product } from "../../data/product.interface";
import {Util} from "../../global/util";
import { ProductDetailPage } from '../../pages/product-detail/product-detail';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { GlobalVariable } from "../../global/global.variable";
import { StatusBar } from '@ionic-native/status-bar';
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage()
@Component({
  selector: 'page-follower-reviews',
  templateUrl: 'follower-reviews.html',
})
export class FollowerReviewsPage {
  Products: any;
  newProducts: any;
  userData: any;
  imageUrl: any;
  socialProfilePic: any;
  isGuestUser: boolean;
  page2 = 0;
  totPg2:any;
  ugc: boolean;
  review: boolean;
  lastPage2: boolean = false;
  FollowingPRListData: any = [];
  reportReasonsList:any = [];
  public pageSubTabs: any;
  isOpen = false;
  util = Util;
  clickedIndex;
  getDynamicHeight1 = "120px";
  selectedSubUgcTab: number;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public statusBar: StatusBar,
    private settingsProvider:SettingsProvider,
    public platform:Platform,
    public UserService: HttpService) {
      this.UserService.toggleLoader("ugc-loader",true);
      this.userData = JSON.parse(localStorage.getItem("UserData"));
      this.imageUrl = localStorage.getItem("myImageUrl");
      this.socialProfilePic = localStorage.getItem("socialProfilePic");
      this.pageSubTabs = "tab1";
      if (!GlobalVariable.isAuthUser) {
        this.isGuestUser = false;
      } else {
        this.isGuestUser = true;
      }
  }
  ionViewDidLoad(){
    this.statusBar.backgroundColorByHexString('#000000');
    this.getAllFollowingUserReview();
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
  // ionicViewDidLoadOnList(){
  //   setTimeout(function(){
  //     var thumbnail = document.getElementsByClassName("thumbnail1");
  //     for (let i = 0; i < thumbnail.length; i++) {
  //       var e = thumbnail[0];
  //       if (e instanceof HTMLElement) {
  //         this.getDynamicHeight1 =  e.style.width;
  //         if(localStorage.getItem("height1") != this.getDynamicHeight1.toString()){
  //           localStorage.setItem("height1",this.getDynamicHeight1.toString());
  //           this.getDynamicHeight1 = localStorage.getItem("height1"); 
  //         }
  //       }
  //     }
  //   },500)
  // }
  getAllFollowingUserReview(){
    this.UserService.GetFollowingContentReview(this.userData.id, this.page2, 8).subscribe(resp => {
      let res = resp.content;
      if(res.length == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader","");
      }
      if(res.length > 0){
        this.totPg2 = resp.totalPages - 1;
      }else{
        this.totPg2 = resp.totalPages;
      }
      for (let index = 0; index < res.length; index++) {
        res[index].isopen = false;
        if (res[index].likes > 99999) res[index].likes = this.getCountStyle(res[index].likes.toString());
            res[index].reported=false;
            for(var reviewReport of res){
              if (reviewReport.productReviewId == res[index].id){
                res[index].reported = true;
              }
            }
        this.FollowingPRListData.push(res[index]);
      }
      this.UserService.GetReviewReportReasons().subscribe(res =>{
        this.reportReasonsList=res;
      })
      if(this.page2 == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-follower-reviews');
      }
      // this.ionicViewDidLoadOnList();
    });
  }
  doInfinite2(infiniteScroll) {
    if (this.lastPage2 == true) return;
    setTimeout(() => {
      this.page2 = this.page2+ 1;
      this.UserService.GetFollowingContentReview(this.userData.id, this.page2, 8).subscribe(resp => {
        let res = resp.content;
        if(res.length > 0){
          this.totPg2 = resp.totalPages - 1;
        }else{
          this.totPg2 = resp.totalPages;
        }
        for (let index = 0; index < res.length; index++) {
          res[index].isopen = false;
          if (res[index].likes > 99999) res[index].likes = this.getCountStyle(res[index].likes.toString());
              res[index].reported=false;
              for(var reviewReport of res){
                if (reviewReport.productReviewId == res[index].id){
                  res[index].reported = true;
                }
              }
          this.FollowingPRListData.push(res[index]);
        }
      });
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 500);
  }
  doInfiniteUGCClicking2(infiniteScroll) {
    if (this.lastPage2 == true) return;
      this.page2 = this.page2+ 1;
      this.UserService.GetFollowingContentReview(this.userData.id, this.page2, 8).subscribe(resp => {
        let res = resp.content;
        if(res.length > 0){
          this.totPg2 = resp.totalPages - 1;
        }else{
          this.totPg2 = resp.totalPages;
        }
        for (let index = 0; index < res.length; index++) {
          this.FollowingPRListData.push(res[index]);
        }
      });
  }
  reviewLikeUp(item:any,i:number)
  {
    this.UserService.addLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.FollowingPRListData[i].liked = true;
        if(this.FollowingPRListData[i].likes<99999) this.FollowingPRListData[i].likes =this.FollowingPRListData[i].likes +1;
      }
    });
  }

  reviewLikeDown(item:any,i:number)
  {
    this.UserService.removeLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.FollowingPRListData[i].liked = false;
        if(this.FollowingPRListData[i].likes<100000) this.FollowingPRListData[i].likes = this.FollowingPRListData[i].likes - 1;
      }
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
  presentReportPrompt(detailData) {
    let alert_ = this.alertCtrl.create();
    /*Report UGC*/
    alert_.setTitle('我要举报！');
    for(let item of this.reportReasonsList){
      alert_.addInput({
        type: 'radio',
        label: item.reason+'',
        value: JSON.stringify(item)+''
      });
    }
    alert_.addButton('取消');
    alert_.addButton({
      text: '提交',
      handler: data => {
        if(data){
          let newData = JSON.parse(data);
          this.UserService.ReportUGC(newData.reason,newData.id,detailData.id).subscribe(res =>{
            this.showAlert();
          });
        }else{
          return false;
        }
      }
    });
    alert_.present();
  }
  showAlert(){
    this.alertCtrl.create({
      title: "",
      message: "谢谢您的反馈！",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
  }
  selectedSubTab(index) {
    this.selectedSubUgcTab = index;
    if (index == 0) {
      this.ugc = true;
      this.review = false;
      this.navCtrl.pop();
    }
    if (index == 1) {
      this.ugc = false;
      this.review = true;
    }
  }
  showProductDetail(product: Product) {
    this.navCtrl.push(ProductDetailPage, {
      id: product.id
    });
  }

  showProduct(productItem: Product) {
    localStorage.setItem("Product", JSON.stringify(productItem));
    this.navCtrl.push(ProductDetailPage, {
      item: productItem
    });
  }
  goToProfile(user: any) {
    if (user.id == localStorage.getItem("UserData.userId")) {
      this.navCtrl.parent.select(4);
    } else {
      this.navCtrl.push(ProfilePublicPage, { userData: user });
    }
  }
  toggleCloseBtn(){
    if(this.isOpen == true){
      this.isOpen = false;
    }
    else{
    this.isOpen = true;
    }
  }
  slideClickList(event){
    this.clickedIndex = event.clickedIndex;
  }
  onReadLessReadMore7(data){
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
    }
  }
}
