import {Component, ElementRef} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { Util } from "../../global/util";
import {HttpService} from "../../services/httpService";
import { ProductDetailPage } from '../product-detail/product-detail';
import { ProfilePublicPage } from '../profile-public/profile-public';
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage({
  segment: "profile/review/:userId"
})
@Component({
  selector: 'page-profile-my-review',
  templateUrl: 'profile-my-review.html',
})
export class ProfileMyReviewPage {
  reviewList: any = [];
  imageUrl: any;
  socialProfilePic:any;
  reportReasonsList:any = [];
  userData:any;
  pageNo:number = 0;
  isOpen = false;
  clickedIndex;
  userId;
  totpg;
  constructor(public navCtrl: NavController,
              public platform:Platform,
              public navParams: NavParams,
              private element:ElementRef,
              private alertCtrl: AlertController,
              public httpService:HttpService,
              private settingsProvider:SettingsProvider) {
    this.reviewList = [];
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    this.userId = this.navParams.get("id");
    this.httpService.GetProductReviewByUserIdPageableSize(this.pageNo,8).subscribe(resp=>{
      if(resp.totalPages == 0){
        this.totpg = resp.totalPages;
      }else{
        this.totpg = resp.totalPages - 1;
      }
      let res = resp.content;
      for(var i=0;i<res.length;i++) {
        res[i].isopen = false;
        this.reviewList.push(res[i]);
      }
    for (let reviewItem of this.reviewList)
    {
      if(reviewItem.user.dob)
      {
        var age:number = Number(new Date().getFullYear())-Number(reviewItem.user.dob.substr(0,4));
        reviewItem.user.age = age;
      }
    }
    for(let index = 0;index< this.reviewList.length; index++)
    {
      this.httpService.GetProductByID(this.reviewList[index].productId).subscribe(res=>
      {
        this.reviewList[index].productImage = res.data.imageArray[0];
        this.reviewList[index].name = res.data.name;
      });
    }
    
    this.httpService.GetReviewReportReasons().subscribe(res =>{
      this.reportReasonsList=res;
    });
    for(let reviewitem of this.reviewList){
      reviewitem.liked = false;
      if (reviewitem.likes > 99999) reviewitem.likes = this.getCountStyle(reviewitem.likes.toString());
      this.httpService.GetProductReviewReportByUserId().subscribe(res=>{
        reviewitem.reported=false;
        for(var reviewReport of res)
        {
          if (reviewReport.productReviewId == reviewitem.id)
          {
            reviewitem.reported = true;
          }
        }
        this.reviewList[reviewitem.sortid]=reviewitem;

      });
    }
  });
  }
  doInfinite(infiniteScroll) {
    this.pageNo = this.pageNo + 1;
    this.httpService.GetProductReviewByUserIdPageableSize(this.pageNo,8).subscribe(resp=>{
      let res = resp.content;
      for(var i=0;i<res.length;i++) {
        res[i].isopen = false;
        this.reviewList.push(res[i]);
      }
      for(let index = 0; index < res.length; index++){
          this.reviewList.push(res[index]);
      }

      for (let reviewItem of this.reviewList)
      {
        if(reviewItem.user.dob)
        {
          var age:number = Number(new Date().getFullYear())-Number(reviewItem.user.dob.substr(0,4));
          reviewItem.user.age = age;
        }
      }
      for(let index = 0;index< this.reviewList.length; index++)
      {
        this.httpService.GetProductByID(this.reviewList[index].productId).subscribe(res=>
        {
          this.reviewList[index].productImage = res.data.imageArray[0];
          this.reviewList[index].name = res.data.name;
        });
      }
      this.httpService.GetReviewReportReasons().subscribe(res =>{
        this.reportReasonsList=res;
      });
      for(let reviewitem of this.reviewList)
      {
        reviewitem.liked = false;
        if (reviewitem.likes > 99999) reviewitem.likes = this.getCountStyle(reviewitem.likes.toString());
        this.httpService.GetProductReviewReportByUserId().subscribe(res=>{
          reviewitem.reported=false;
          for(var reviewReport of res)
          {
            if (reviewReport.productReviewId == reviewitem.id)
            {
              reviewitem.reported = true;
            }
          }
          this.reviewList[reviewitem.sortid]=reviewitem;

        });
      }

    });
    if(infiniteScroll!=''){
      infiniteScroll.complete();
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

  goToProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }
  reviewLikeUp(item:any,i:number)
  {
    this.httpService.addLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewList[i].liked = true;
        if(this.reviewList[i].likes<99999) this.reviewList[i].likes =this.reviewList[i].likes +1;
      }
    });
  }

  reviewLikeDown(item:any,i:number)
  {
    this.httpService.removeLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewList[i].liked = false;
        if(this.reviewList[i].likes<100000) this.reviewList[i].likes = this.reviewList[i].likes - 1;
      }
    });
  }

  presentReportPrompt(item:any) {
    let alert = this.alertCtrl.create();
    alert.setTitle('我要举报该评价！');
    for(let item of this.reportReasonsList){
      alert.addInput({
        type: 'radio',
        label: item.reason+'',
        value: JSON.stringify(item)+''
      });
    }
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Submit',
      handler: data => {
        if(data){
          let newData = JSON.parse(data);
          console.log(JSON.stringify(newData));
          console.log(item.id);
          this.httpService.ReportReview(newData.reason,newData.id,item.id).subscribe(res =>{
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

  showSuccessMessage(){
    this.alertCtrl.create({
      title: "",
      message: "谢谢您的反馈！",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
  }
  readMore(item: any, i :number)
  {
    item.readmore = true;
  }
  readLess(item: any, i :number)
  {
    item.readmore = false;
  }
  toggleClose(){
    if(this.isOpen == true){
      this.isOpen = false;
    }
    else{
    this.isOpen = true;
    }
  }
  slideClick(event){
    this.clickedIndex = event.clickedIndex;
  }
  showProduct(productItem: any) {
    localStorage.setItem("Product",JSON.stringify(productItem));
    this.navCtrl.push(ProductDetailPage, {
      item: productItem,
      id:productItem.id
    });
  }
  onReadLessReadMore5(data){
    console.log(data);
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
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
  }
}
