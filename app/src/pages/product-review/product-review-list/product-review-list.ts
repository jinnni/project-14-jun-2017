import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, NavParams, Content, AlertController, Platform} from 'ionic-angular';
import {HttpService} from "../../../services/httpService";
import {MoreContentPage} from "../../../pages/more-content/more-content";
import {GlobalVariable} from "../../../global/global.variable";
import {CreateProductReviewPage} from "../../create-product-review/create-product-review";
import { ProfilePublicPage } from '../../../pages/profile-public/profile-public';
import { SettingsProvider } from '../../../providers/settingsProvider';

@Component({
  selector: 'page-product-review-list',
  templateUrl: 'product-review-list.html'
})
export class ProductReviewListPage {

  @ViewChild(Content) content: Content;
  userId: any;
  reviewList: any=[];
  initialList: any=[];
  productId:any;
  imageUrl:any;
  userData:any;
  socialProfilePic:any;
  isGuestUser:boolean;
  isScroll:boolean;
  lastPage:boolean;
  reportReasonsList:any = [];
  pageNo:number = 0;
  initial_status:boolean=false;
  isOpen = false;
  reviewArrlist = [];
  getDynamicHeight1 = "120px";
  clickedIndex;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private httpService: HttpService,
              private alertCtrl: AlertController,
              private element:ElementRef,
              public platform: Platform,
              private settingsProvider:SettingsProvider,
              public  UserService:HttpService) {
    this.UserService.toggleLoader("ugc-loader",true);
    this.userId = localStorage.getItem("UserData.userId");
    this.productId = navParams.get("productId");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    if(this.userData.dob)
    {
      var age:number = Number(new Date().getFullYear())-Number(this.userData.dob.substr(0,4));
      this.userData.age = age;
    }
    if(GlobalVariable.isAuthUser){
      this.isGuestUser = true;
    }else{
      this.isGuestUser = false;
    }
    this.UserService.GetReviewReportReasons().subscribe(res =>{
      this.reportReasonsList=res;
    })
  }
  slideClickList(event){
    this.clickedIndex = event.clickedIndex;
  }
  toggleCloseBtn(){
    if(this.isOpen == true){
      this.isOpen = false;
    }
    else{
    this.isOpen = true;
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
    this.reviewList = [];
    this.getProductReviewByUserId(0);
  }
  getProductReviewByUserId(pageno){
    this.httpService.GetProductReviewByUserIdFollowedByOthersReview(this.productId,pageno,8).subscribe(res =>{
      this.lastPage = res.last;
      for(var i=0;i<res.content.length;i++) {
        res.content[i].isopen = false;
        this.reviewList.push(res.content[i]);
      }
      this.UserService.GetProductReviewReportByUserId().subscribe(res => {
        for(let reviewitem of this.reviewList){
          if (reviewitem.likes > 99999) reviewitem.likes = this.getCountStyle(reviewitem.likes.toString());
          reviewitem.reported=false;
          for(var reviewReport of res){
            if (reviewReport.productReviewId == reviewitem.id){
              reviewitem.reported = true;
            }
          }
        }
      });
      this.UserService.getAllImagesWithClassname("ugc-loader",'page-product-detail');
      // this.ionicViewDidEnter();
    },error =>{
      this.UserService.getAllImagesWithClassname("ugc-loader",'');
    });
  }
  /* Get Product Review By Product ID*/

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

  doInfinite(infiniteScroll) {
    this.pageNo++;
    this.getProductReviewByUserId(this.pageNo);
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }

  presentReportPrompt(item:any) {
    let alert = this.alertCtrl.create();
    /*Report Review*/
    alert.setTitle('我要举报该评价！');
    for(let item of this.reportReasonsList){
      alert.addInput({
        type: 'radio',
        label: item.reason+'',
        value: JSON.stringify(item)+''
      });
    }
    alert.addButton('取消');
    alert.addButton({
      text: '提交',
      handler: data => {
        if(data){
          let newData = JSON.parse(data);
          console.log(JSON.stringify(newData));
          console.log(item.id);
          this.UserService.ReportReview(newData.reason,newData.id,item.id).subscribe(res =>{
            this.showSuccessMessage();
            item.reported = true;
          });
        }else{
          return false;
        }

      }
    });
    alert.present();
  }

  showSuccessMessage() {
    this.alertCtrl.create({
      title: "",
      message: "谢谢您的反馈！",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
  }

  goToProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }
  showMoreContent(item){
    if(GlobalVariable.isAuthUser){
      this.navCtrl.push(MoreContentPage,{data:item,title:"Review"});
    }else{
      this.alertCtrl.create({
        title: "",
        message: "登录后才能看到更多内容哦！",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
    }
  }

  reviewLikeUp(item:any,i:number)
  {
    this.UserService.addLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewList[i].liked = true;
        if(this.reviewList[i].likes<99999) this.reviewList[i].likes =this.reviewList[i].likes +1;
        this.settingsProvider.currentPageRefresh = "product-review-list";
      }
    });
  }

  reviewLikeDown(item:any,i:number)
  {
    this.UserService.removeLike(this.productId,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewList[i].liked = false;
        if(this.reviewList[i].likes<100000) this.reviewList[i].likes = this.reviewList[i].likes - 1;
        this.settingsProvider.currentPageRefresh = "product-review-list";
      }
    });
  }

  editReview(i:number)
  {
    this.navCtrl.push(CreateProductReviewPage,{reviewId:this.reviewList[i].id,productId:this.productId,reviewContent:this.reviewList[i].content, images:this.reviewList[i].imageArray,rating:this.reviewList[i].rating});
  }

  readMore(item: any, i :number)
  {
    item.readmore = true;
  }

  readLess(item: any, i :number)
  {
    item.readmore = false;
  }
  onReadLessReadMore2(data){
    console.log(data);
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
    }
  }
}
