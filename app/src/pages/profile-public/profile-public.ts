import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams, Platform, App} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {Product} from "../../data/product.interface";
import {ProductDetailPage} from "../product-detail/product-detail";
import {ProfileLikedProductsPage} from "../profile-liked-products/profile-liked-products";
import {ProfileMyReviewPage} from "../profile-my-review/profile-my-review";
import {ProfileMyQuestionPage} from "../profile-my-question/profile-my-question";
import {ProfileMyAnswerPage} from "../profile-my-answer/profile-my-answer";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import {ProfileMyUgcPage} from "../profile-my-ugc/profile-my-ugc";
import {CommentPage} from "../comment/comment";
import {UgcDetailPage} from "../ugc-detail/ugc-detail";
import {GlobalVariable} from "../../global/global.variable";
import { Util } from "../../global/util";
import {FormControl} from "@angular/forms";
import { ArticleDetailPage } from '../article-detail/article-detail';
import { ProfileMyBadgePage } from '../profile-my-badge/profile-my-badge';
import { SettingsProvider } from '../../providers/settingsProvider';
import { EditorScorePage } from '../editor-score/editor-score';
import { StatusBar } from '@ionic-native/status-bar';
@IonicPage({
  segment: "profile/public/:id"
})
@Component({
  selector: 'page-profile-public',
  templateUrl: 'profile-public.html',
})
export class ProfilePublicPage {
  userData:any;
  newProducts: any;
  Products: any;
  userDataStorage:any;
  profileImage='';
  backgroundImage='';
  likedProducts: Array<Product> = [];
  likedProductsAll: any ;
  questionsList: any;
  answersList: any;
  reviewList: any;
  reviewListThree: any;
  ugcList: any;
  badgeList: any;
  reportReasonsList:any = [];
  userId:any;
  imageUrl:string;
  socialProfilePic:string;
  userAuth:boolean;
  isFollowing:boolean = false;
  isGuestUser:boolean;
  ugcSearchList: any;
  ugcCollection:any;
  finalUgcCollection:any;
  finalUgcCollectionSimilar:any;
  ugcCollectionLength: any;
  searchTerm: string = '';
  searchBarControl: FormControl;
  searching: any = false;
  blank: any = true;
  featureListOdd: any = [];
  featureListEven: any = [];
  pageNo:number = 0;
  slidesPerView:number = 0;
  isOpen = false;
  clickedIndex;
  reviewarr = [];
  getDynamicHeight = "120px";
  firstItem;
  firstItemId;
  firstItemStatus;
  socialImpactScore:number;
  badgelist:number;
  questionslist:number;
  answerslist:number;
  reviewCount:number;
  lastPage: boolean = false;
  lastPageTimeline: boolean = false;
  pageNoFeatured = 0;
  follower:number;
  following:number;
  isfollowing:boolean = false;
  editorScore;
  constructor(private navCtrl: NavController,
              public appCtrl: App,
              public navParams: NavParams,
              public UserService: HttpService,
              public platform: Platform,
              public statusBar: StatusBar,
              private alertCtrl: AlertController,
              private settingsProvider:SettingsProvider,
              private httpService: HttpService) {
    this.searchBarControl = new FormControl();
    this.answersList = [];
    this.questionsList = [];
    this.reviewList = [];
    this.reviewListThree = [];
    this.badgeList = [];
    this.likedProductsAll = [];
    this.ugcList = [];
    this.UserService.toggleLoader("ugc-loader",true);
    this.userDataStorage =JSON.parse(localStorage.getItem("UserData"));
    this.userAuth = GlobalVariable.isAuthUser;
    if(!GlobalVariable.isAuthUser){
      this.isGuestUser =false;
    }else{
      this.isGuestUser =true;
    }
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData = navParams.get("userData");
    if(this.userData.hasOwnProperty("socialImpactScore") == false){
      this.userData.socialImpactScore = 0;
    }
    if(this.userData.dob){
      var age:number = Number(new Date().getFullYear())-Number(this.userData.dob.substr(0,4));
      this.userData.age = age;
    }
    if(this.userData.hasOwnProperty("profileImage")){
      this.profileImage = this.userData.profileImage;
    }
    if(this.userData.hasOwnProperty("backgroundImage")){
      this.backgroundImage = this.userData.backgroundImage;
    }
    new Promise((resolve,reject)=>{
      resolve();
    }).then(sourcetype => {
      this.getEditorScore();
    }).then(sourcetype => {
      this.getFeaturedUGC();
    }).then(sourcetype => {
      this.getPublicCountDetail();
    }).then(sourcetype => {
      this.getProductReviewByUserId();
    }).then(sourcetype => {
      this.getUserFollowingsWithPassingId();
    }).then(sourcetype => {
      this.getUserLikedProducts();
    }).then(sourcetype => {
      this.getAllBagdeListByOtherUserId();
    }).then(sourcetype => {
      this.getUgcListByUserId();
    }).then(sourcetype => {
      this.httpService.GetReviewReportReasons().subscribe(res =>{
        this.reportReasonsList=res;
      });
    }).then(sourceType => {
      this.httpService.getAllImagesWithClassname("ugc-loader",'page-profile-public');
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
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
  }
  showScorePage() {
    this.navCtrl.push(EditorScorePage,{'userId': this.userData.id});
  }
  getPublicCountDetail(){
    this.UserService.GetPublicCountDetail(this.userData.id).subscribe(res => {
      this.socialImpactScore = res.socialImpactScore || 0;
      this.badgelist = res.earnedBadges || 0;
      this.reviewCount = res.reviewCount || 0;
      this.questionslist = res.questionCount || 0;
      this.answerslist = res.answerCount || 0;
    });
  }
  getEditorScore(){
    this.httpService.GetEditorScore(this.userData.id).subscribe(res => {
      this.editorScore = res.score;
    });
  }
  getFeaturedUGC() {
    this.UserService.GetMostLikefeaturedUgcByUserId(this.userData.id, this.pageNoFeatured).subscribe(res => {
      var featuredUgc = [];
      let pushOdd = false;
      if (res.length < 1)
      this.lastPage = true;
      if(res.length > 0){
        if(res.length > 4){
          for(let i=0; i< 4; i++){
            featuredUgc.push(res[i]);
          }
        }else{
          for(let i=0; i< res.length; i++){
            featuredUgc.push(res[i]);
          }
        }
        this.firstItem = featuredUgc[0];
        this.firstItemId = featuredUgc[0].id;
        this.firstItemStatus = featuredUgc[0].status;
      }else{
        return;
      }
      for (let i = 0; i < featuredUgc.length; i++) {
        if (featuredUgc[i].user.recordStatus == "ACTIVE" && featuredUgc[i].user.id == this.userData.id) {
          if (Number(featuredUgc[i].likeCount) > 99999) featuredUgc[i].likeCount = this.getCountStyle(featuredUgc[i].likeCount.toString());
          let isInsert = true;
          if (featuredUgc[i].hasOwnProperty('timelineContent')) {
            isInsert = featuredUgc[i].timelineContent != "ARTICLE"
          }
          if (isInsert) {
            if (pushOdd == true) {
              this.featureListEven.push(featuredUgc[i]);
              pushOdd = false;
            } else {
              this.featureListOdd.push(featuredUgc[i]);
              pushOdd = true;
            }
          }
        }
      }
    })
  }
  triggerGoDetail(){
    this.navCtrl.push(UgcDetailPage, {
      item: this.firstItem,
      id: this.firstItemId,
      status: this.firstItemStatus,
      userId:this.userData.id
    });
  }
  getUgcListByUserId() {
    this.httpService.GetUgcByIdUserAndPage(this.userData.id,this.pageNo).subscribe(res =>{
      var userUgc = [];
      let pushOdd = false;
      if (res.length < 1)
      this.lastPageTimeline = true;
      if(res.length > 0){
        if(res.length > 4){
          for(let i=0; i< 4; i++){
            res[i].createComment = {postComment:''}
            if(res[i].timelineContent == "ARTICLE"){
              this.ugcList.push(res[i]);
            }else{
              userUgc.push(res[i]);
            }
          }
        }else{
          for(let i=0; i< res.length; i++){
            res[i].createComment = {postComment:''}
            if(res[i].timelineContent == "ARTICLE"){
              this.ugcList.push(res[i]);
            }else{
              userUgc.push(res[i]);
            }
          }
        }
        for (let i = 0; i < userUgc.length; i++) {
          if (userUgc[i].user.recordStatus == "ACTIVE") {
            if (Number(userUgc[i].likeCount) > 99999) userUgc[i].likeCount = this.getCountStyle(userUgc[i].likeCount.toString());
            let isInsert = true;
            if (userUgc[i].hasOwnProperty('timelineContent')) {
              isInsert = userUgc[i].timelineContent != "ARTICLE"
            }
            if (isInsert) {
              if (pushOdd == true) {
                this.featureListEven.push(userUgc[i]);
                pushOdd = false;
              } else {
                this.featureListOdd.push(userUgc[i]);
                pushOdd = true;
              }
            }
            
            
            this.firstItem = userUgc[0];
            this.firstItemId = userUgc[0].id;
            this.firstItemStatus = userUgc[0].status;
          }
        }

        console.log(this.featureListEven);
            console.log(this.featureListOdd);
        for(let ugcItem of this.ugcList){
          this.isFollowing = this.ugcList[0].user.following;
          if(ugcItem.likeCount>99999)
          {
            ugcItem.likeCount = this.getCountStyle(ugcItem.likeCount.toString());
          }
          if(ugcItem.user.dob)
          {
            let age:number = Number(new Date().getFullYear())-Number(ugcItem.user.dob.substr(0,4));
            ugcItem.user.age = age;
          }
        }
      }
    });
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
  ionicViewDidEnter(){
    setTimeout(() => {
      var thumbnail = document.getElementsByClassName("thumbnails");
      for (let i = 0; i < thumbnail.length; i++) {
        var e = thumbnail[0];
        if (e instanceof HTMLElement) {
          this.getDynamicHeight =  e.style.width;
          if(localStorage.getItem("height") != this.getDynamicHeight.toString()){
            localStorage.setItem("height",this.getDynamicHeight.toString());
            this.getDynamicHeight = localStorage.getItem("height"); 
          }
        }
      }
    }, 500); 
  }
  getCountStyle(count:any){
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
  getProductReviewByUserId(){
    this.httpService.GetProductReviewByUserIdPageableSize(this.pageNo,8, this.userData.id).subscribe(resp =>{
      let res = resp.content;
      this.reviewList = res;
      if(res.length < 3){
        for(var i=0;i<res.length;i++) {
          res[i].isopen = false;
          res[i].readmore = false;
          this.reviewList[i] = res[i];
          this.reviewListThree.push(this.reviewList[i]);
        }
      } else{
        for(var i=0;i<res.length;i++) {
          res[i].isopen = false;
        }
        for(var i=0;i<3;i++) {
          res[i].isopen = false;
          res[i].readmore = false;
          this.reviewList[i] = res[i];
          this.reviewListThree.push(this.reviewList[i]);
        }
      }
      
      for(let reviewitem of this.reviewListThree){
        if (reviewitem.likes > 99999) reviewitem.likes = this.getCountStyle(reviewitem.likes.toString());
        this.httpService.GetProductReviewReportByUserId().subscribe(res=>{
          reviewitem.reported=false;
          for(var reviewReport of res){
            if (reviewReport.productReviewId == reviewitem.id){
              reviewitem.reported = true;
            }
          }
          this.reviewListThree[reviewitem.sortid]=reviewitem;
        });
      }
      for(let index = 0;index< this.reviewListThree.length; index++){
        this.httpService.GetProductByID(this.reviewListThree[index].productId).subscribe(res=>{
          if(res.data.imageArray[0]) {
            this.reviewListThree[index].productImage = res.data.imageArray[0];
          }
          this.reviewListThree[index].name = res.data.name;
          this.reviewListThree[index].product = res.data;
        });
        if(this.reviewListThree[index].user.dob){
          var age:number = Number(new Date().getFullYear())-Number(this.reviewListThree[index].user.dob.substr(0,4));
          this.reviewListThree[index].user.age = age;
        }
      }
    });
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
  // getProductQuestionsByUserId(){
  //   this.httpService.GetProductQuestionsByUserId(this.userData.id).subscribe(res =>{
  //     this.questionsList = res;
  //   });
  // }
  // getProductAnswersByUserId(){
  //   this.httpService.GetProductAnswersByUserId(this.userData.id).subscribe(res =>{
  //     this.answersList = res;
  //   });
  // }
  getUserLikedProducts(){
    this.httpService.GetProductsLikeByUser(this.userData.id).subscribe(res =>{
      this.likedProductsAll = res;
      if(res.length > 0 && res.length < 4){
        this.slidesPerView = res.length;
        this.likedProducts = res;
      }else if(res.length >= 4){
        this.slidesPerView = 3;
        this.likedProducts = res.splice(0,3);
      }
    });
  }
  getAllBagdeListByOtherUserId(){
    this.httpService.GetAllBagdeListByOtherUserId(this.userData.id).subscribe(res =>{
      this.badgeList = res;
    });
  }
  showAllLikedProducts() {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(ProfileLikedProductsPage, {
        userId: this.userData.id,
        title: "心愿清单"
      });
    }
  }
  showReviews() {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(ProfileMyReviewPage, {reviewList: this.reviewList,id:this.userData.id});
    }
  }
  showBadges() {
    this.navCtrl.push(ProfileMyBadgePage, {userId: this.userData.id,title: "我的勋章"});
  }
  showQuestions() {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(ProfileMyQuestionPage, {question: this.questionsList});
    }
  }
  showAnswers() {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(ProfileMyAnswerPage, {userId: this.userData.id});
    }
  }
  reviewLikeUp(item:any,i:number){
    this.httpService.addLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewListThree[i].liked = true;
        if(this.reviewListThree[i].likes<99999) this.reviewListThree[i].likes =this.reviewListThree[i].likes +1;
      }
    });
  }
  reviewLikeDown(item:any,i:number){
    this.httpService.removeLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewListThree[i].liked = false;
        if(this.reviewListThree[i].likes<100000) this.reviewListThree[i].likes = this.reviewListThree[i].likes - 1;
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
  goToBack(){
    this.navCtrl.pop();
  }
  toggleFollowUser() {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.settingsProvider.setCurrentPage("public-profile");
      this.httpService.followUser(localStorage.getItem("UserData.userId"),this.userData.id,"/users",true).subscribe(res =>{
        this.isfollowing = true;
      });
    }
  }
  toggleUnfollowUser() {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.settingsProvider.setCurrentPage("public-profile");
      this.httpService.unfollowUser(localStorage.getItem("UserData.userId"),this.userData.id,"/users",true).subscribe(res =>{
        this.isfollowing = false;
      });
    }
  }
  gotoNext(id,item,index){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.ugcList[index].viewCount = this.ugcList[index].viewCount+1;
      this.navCtrl.push(ArticleDetailPage, {item: item,id: id,status: item.status});
    }
  }
  toggleLikeUp(item:any,pos:number,type:string) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.httpService.addLike(item.id,"/ugc",true).subscribe(res =>{
        if(type=='featureListEven'){
          this.featureListEven[pos].liked = 1;
          if(this.featureListEven[pos].likeCount<=99998) this.featureListEven[pos].likeCount = this.featureListEven[pos].likeCount + 1;
        }else if(type=='featureListOdd'){
          this.featureListOdd[pos].liked = 1;
          if(this.featureListOdd[pos].likeCount<=99998) this.featureListOdd[pos].likeCount = this.featureListOdd[pos].likeCount + 1;
        }else{
          this.ugcList[pos].liked = 1;
          this.ugcList[pos].likeCount = this.ugcList[pos].likeCount + 1;
        }
      });
    }
  }
  toggleLikeDown(item:any,pos:number,type:string){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.httpService.removeLike(item.id,"/ugc",true).subscribe(res =>{
        if(type=='featureListEven'){
          this.featureListEven[pos].liked = 0;
          if(this.featureListEven[pos].likeCount<=99998) this.featureListEven[pos].likeCount = this.featureListEven[pos].likeCount - 1;
        }else if(type=='featureListOdd'){
          this.featureListOdd[pos].liked = 0;
          if(this.featureListOdd[pos].likeCount<=99998) this.featureListOdd[pos].likeCount = this.featureListOdd[pos].likeCount - 1;
        }else{
          this.ugcList[pos].liked = 0;
          this.ugcList[pos].likeCount = this.ugcList[pos].likeCount - 1;
        }
      });
    }
  }
  ugcComment(item: any){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(CommentPage,{item: item, id:item.id, userId:this.userData.id});
    }
  }
  showProduct(productItem: any) {
    localStorage.setItem("Product",JSON.stringify(productItem));
    this.navCtrl.push(ProductDetailPage, {
      item: productItem,
      id:productItem.id
    });
  }
  readMore(item: any, i :number)
  {
    item.readmore = true;
  }
  readLess(item: any, i :number)
  {
    item.readmore = false;
  }
  GoDetail(item, id, status) {
    this.navCtrl.push(UgcDetailPage, {
      item: item,
      id: id,
      status: status,
      userId:this.userData.id
    });
  }
  doInfinite(infiniteScroll) {
    if (this.lastPage == true) {return;}
    setTimeout(() => {
    // if(this.feature){
      this.pageNoFeatured = this.pageNoFeatured + 1;
      this.getFeaturedUGC();
    // }else{

    // }
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
    }, 500);
  }
  doInfiniteTimeline(infiniteScroll) {
    if (this.lastPageTimeline == true) {return;}
    this.pageNo = this.pageNo + 1;
    this.getUgcListByUserId();
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }
  
  getUserFollowingsWithPassingId(){
    this.httpService.GetUserFollowingFollowerCounts(this.userData.id).subscribe(res => {
      console.log(res);
      this.following = res.followingCount;
      this.follower = res.followerCount;
    });
  }
  onReadLessReadMore4(data){
    console.log(data);
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
    }
  }
}
