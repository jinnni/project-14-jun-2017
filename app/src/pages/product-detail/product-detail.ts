
import {Component, ElementRef} from '@angular/core';
import {
  IonicPage, NavController, NavParams, Platform, ToastController, ActionSheetController,
  AlertController,
  App
} from 'ionic-angular';
import {ProductQnaListPage} from "../product-qna/product-qna-list/product-qna-list";
import {ProductReviewListPage} from "../product-review/product-review-list/product-review-list";
import {ProductQnaAskQuestionPage} from "../product-qna/product-qna-ask-question/product-qna-ask-question";
import {ProductQnaDetailPage} from "../product-qna/product-qna-detail/product-qna-detail";
import {HttpService} from "../../services/httpService";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import {Product} from "../../data/product.interface";
import {ProductService} from "../../services/productService";
import {QnaItemType} from "../../global/qnaItemType";
import {BadgeDetailPage} from "../badge-detail/badge-detail";
import {Badge} from "../../data/badge.interface";
import {GlobalVariable} from "../../global/global.variable";
import { Clipboard } from '@ionic-native/clipboard';
import {Util} from "../../global/util";
import {CreateProductReviewPage} from "../create-product-review/create-product-review";
import { SettingsProvider } from '../../providers/settingsProvider';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { StatusBar } from '@ionic-native/status-bar';
declare let WeiboSDK:any;
declare let Wechat:any;

@IonicPage({
  segment: "product/:id"
})
@Component({
  selector: 'page-product-detail',
  templateUrl: 'product-detail.html'
})
export class ProductDetailPage {
  productData: any;
  relatedProducts: Product[];
  questionList:any;
  userData:any;
  userDataStorage:any;
  reviewList: any=[];
  reviewListCount: string = "";
  type = 'product';
  userId: any;
  relatedBadges: Badge[];
  Badges:any=[];
  util = Util;
  productId:any;
  productImage:string;
  partnerImage:any;
  partnerName:string="";
  productPrice:number=0;
  from:string;
  imageUrl:string;
  socialProfilePic:string;
  ProductDetails:any;
  badgeId:any;
  challengeId:any;
  isGuestUser:boolean;
  partnerList:any=[];
  reportReasonsList:any = [];
  initial_status:boolean=false;
  lengthDiff = 0;
  scrollPosition = 0;
  isOpen = false;
  reviewarr = [];
  tenReviewList = [];
  getDynamicHeight = "";
  clickedIndex;
  userProductReview;
  islast=false;
  constructor(private navCtrl: NavController,
              public appCtrl: App,
              public navParams: NavParams,
              private productService: ProductService,
              private toastCtrl: ToastController,
              private clipboard: Clipboard,
              private httpService: HttpService,
              private actionsheetCtrl: ActionSheetController,
              public  UserService:HttpService,
              public statusBar: StatusBar,
              private alertCtrl: AlertController,
              private platform:Platform,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.UserService.toggleLoader("ugc-loader",true);
    this.userId = localStorage.getItem("UserData.userId");
    this.productData = navParams.get("item");
    if (this.productData.liked == undefined) {
      this.productData.liked = false;
    }
    this.productData.rating = Number(this.productData.rating).toFixed(1);
    this.from = navParams.get("from");
    this.badgeId = navParams.get("badgeId");
    this.challengeId = navParams.get("challengeId");
    this.productId=this.productData.id;
    this.productImage =this.productData.imageArray;
    this.relatedProducts = this.resolveRelatedProduct();
    this.relatedBadges = this.productData.productBadges;
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    this.statusBar.backgroundColorByHexString('#000000');
  }
  toggleClose(){
    if(this.isOpen == true){
      this.isOpen = false;
    }
    else{
    this.isOpen = true;
    }
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
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
    if(this.userData.dob)
    {
      var age:number = Number(new Date().getFullYear())-Number(this.userData.dob.substr(0,4));
      this.userData.age = age;
    }
    this.userDataStorage =JSON.parse(localStorage.getItem("UserData"));
    if(GlobalVariable.isAuthUser){
      this.isGuestUser = true;
    }else{
      this.isGuestUser = false;
    }
    this.UserService.GetProductPartnerByProductId(this.productId).subscribe(res => {
      var index:number=0;
      var m_partnerList:any=[];
      this.partnerList=[];
      for(var productPartner of res)
      {
        if(productPartner.productId.toString()==this.productId.toString())
        {
          var s_partner={'partnerId':'','productPrice':'','partnerName':'','partnerImage':'','productUrl':'','islast':false};
          s_partner.partnerId=productPartner.partnerId;
          s_partner.productPrice=productPartner.productPrice;
          s_partner.productUrl=productPartner.urlLink;
          m_partnerList.push(s_partner);
        }
      }
      this.UserService.GetPartnerList().subscribe(resp=>{
        for(var m_partner of m_partnerList) {
          index++;
          for (var partner of resp) {
            if (partner.id == m_partner.partnerId) {
              if(index==m_partnerList.length)
              {
                m_partner.islast=true;
              }
              m_partner.partnerName = partner.name;
              m_partner.partnerImage = this.imageUrl + partner.imageName;
              this.partnerList.push(m_partner);
              break;
            }
          }
        }
      })
    });
    this.getBadgeByProductId(this.productId)
    this.UserService.GetReviewReportReasons().subscribe(res =>{
      this.reportReasonsList=res;
    })
    Util.unRegisterBackButton(this.platform,this.navCtrl);
    // if(this.settingsProvider.currentPageRefresh == "product-review-list"){
      // console.log("product-review-list");
      this.getProductReviewByUserId();
      this.GetQuestionProduct(this.productId);
    // } 
  }
  // ionicViewDidEnter(){
  //   setTimeout(() => {
  //     var thumbnail = document.getElementsByClassName("thumbnails");
  //     for (let i = 0; i < thumbnail.length; i++) {
  //       var e = thumbnail[0];
  //       if (e instanceof HTMLElement) {
  //         this.getDynamicHeight =  e.style.width;
  //         if(localStorage.getItem("height") != this.getDynamicHeight.toString()){
  //           localStorage.setItem("height",this.getDynamicHeight.toString());
  //           this.getDynamicHeight = localStorage.getItem("height"); 
  //         }
  //       }
  //     }
  //   }, 500); 
  // }
  getBadgeByProductId(productId:any){
    this.UserService.GetBadgesByProductid(productId).subscribe(res => {
      for(let index = 0; index < res.length; index++){
        this.Badges.push(res[index]);
      }
    });
  }
  showAlert(){
    this.alertCtrl.create({
      title: "",
      message: "你已经举报成功了！",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
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
  getReviewReportReasons(){
    this.UserService.GetReviewReportReasons().subscribe(res =>{
      this.reportReasonsList=res;
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
    alert.addButton('取消');
    alert.addButton({
      text: '提交',
      handler: data => {
        if(data){
          let newData = JSON.parse(data);
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

  showSuccessMessage(){
    this.alertCtrl.create({
      title: "",
      message: "谢谢您的反馈！",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
  }

  getScroll(){
    var outer = document.getElementsByClassName("badge-section")[0];
    var inner = document.getElementsByClassName("badge-image")[0];
    this.scrollPosition = outer.scrollLeft;
  }

  getHW(path){
    let height = 0,width = 0;
    var img = new Image();
    img.addEventListener("load", function(){
      height = this.naturalHeight;
      width = this.naturalWidth;
    });
    img.src = path;
  }
  getProductReviewByUserId(){
    this.reviewList = [];
    this.httpService.GetProductReviewByUserIdFollowedByOthersReview(this.productId,0,5).subscribe(res =>{
      this.islast = res.last;
      for(var i=0;i<res.content.length;i++) {
        res.content[i].isopen = false;
        this.userProductReview = res.content[i]
        this.reviewList.push(res.content[i]);
      }     
      this.tenReviewList = this.reviewList 
      this.UserService.GetProductReviewReportByUserId().subscribe(res => {
        for(let reviewitem of this.tenReviewList){
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
  slideClick(event){
    this.clickedIndex = event.clickedIndex;
  }

  /* Get Product Question By Product ID*/
  GetQuestionProduct(productId:number){
    this.UserService.GetQuestionProductById(productId).subscribe(res =>{
      this.questionList = res;
    });
  }

  seeBadge(badge) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(BadgeDetailPage, {id: badge.id});
    }
  }

  resolveRelatedProduct() {
    if (!this.productData.relatedProductsId) {
      return [];
    }
    var item = [];
    const result = [];
    for (let productId of this.productData.relatedProductsId) {
      this.httpService.GetProductByID(productId).subscribe(res => {
        result.push(item);
      });
      // let item = this.productService.getProductById(productId);
      // if (item)
        
    }
    return result;
  }

  readMore(item: any, i :number)
  {
    item.readmore = true;
  }

  readLess(item: any, i :number)
  {
    item.readmore = false;
  }

  showWriteReview() {
    if(this.settingsProvider.userStatus.productReview){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    if(!GlobalVariable.isAuthUser){
      Util.showSimpleToastOnTop("你必须登录才能看到此页面",this.toastCtrl);
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      var flag = 1;
      for(var i=0;i<this.reviewList.length;i++){
        if(this.reviewList[i].user.id == localStorage.getItem("UserData.userId")){
          Util.showSimpleToastOnTop("你已提交评价！",this.toastCtrl);
          if(this.from == "challenge"){
            console.log(this.userProductReview);
            var body = {
              "id":this.userProductReview.id,
              "productId":this.userProductReview.productId,
              "userId":this.userProductReview.userId,
              "content":this.userProductReview.content,
              "rating":this.userProductReview.rating,
              "challengeId":this.challengeId,
            }
            this.httpService.UpdateProductReview(body).subscribe(res =>{
              console.log(res);
            });
          }
          flag = 0;
          break;
        }
      }
      if(flag == 1){
        if(this.from == "challenge"){
          this.navCtrl.push(CreateProductReviewPage,{productId: this.productId,from:this.from,badgeId:this.badgeId,challengeId:this.challengeId});
        }else{
          this.navCtrl.push(CreateProductReviewPage,{productId: this.productId,from:this.from,badgeId:this.badgeId});
        }
      }
    }
  }

  showAskQuestion() {
    if(this.settingsProvider.userStatus.productDetailQuestion){
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
      this.navCtrl.push(ProductQnaAskQuestionPage,{productId: this.productId,productName:this.productData.name});
    }
  }

  reviewLikeUp(item:any,i:number)
  {
    this.UserService.addLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewList[i].liked = true;
        if(this.reviewList[i].likes<99999) this.reviewList[i].likes =this.reviewList[i].likes +1;
      }
    });
  }

  reviewLikeDown(item:any,i:number)
  {
    this.UserService.removeLike(item.id,"/review",true).subscribe(res=>{
      if(res != null)
      {
        this.reviewList[i].liked = false;
        if(this.reviewList[i].likes<100000) this.reviewList[i].likes = this.reviewList[i].likes - 1;
      }
    });
  }

  showQnaList() {
    this.navCtrl.push(ProductQnaListPage, this.productData);
  }

  showReviewList() {
    this.navCtrl.push(ProductReviewListPage, {productId: this.productId});
  }

  /*Never User In HTMl*/
  showProductDetail(productItem: Product) {
    this.navCtrl.push(ProductDetailPage, productItem);
  }

  showQuestionDetail(questionItem: any) {
    this.navCtrl.push(ProductQnaDetailPage, {
      type: QnaItemType.QUESTION_DETAIL,
      qnaData: questionItem,
      productName: this.productData.name
    });
  }

  /*Like Product*/
  toggleLikeUp(item:any) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.UserService.addLike(item.id,"/products",true).subscribe(res =>{
        this.productData.liked = true;
        this.productData.likeCount = this.productData.likeCount+1;
      });
    }
  }

  /*Dislike Product*/
  toggleLikeDown(item:any){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.UserService.removeLike(item.id,"/products",true).subscribe(res =>{
        this.productData.liked = false;
        this.productData.likeCount = this.productData.likeCount-1;
      });
    }
  }

  toggleShare(productData:any){
    let actionSheet = this.actionsheetCtrl.create({
      title: '分享此产品',
      cssClass: 'action-sheets-grid',
      buttons: [
        {
          cssClass:'btn-wechat',
          handler: () => {
            Wechat.share({
              message: {
                title: productData.name,
                description: "This is description.",
                thumb: this.imageUrl + this.productImage[0],
                media: {
                  type: Wechat.Type.LINK,
                  webpageUrl: "pjapp://pjdarenapp.com"
                }
              },
              scene: Wechat.Scene.TIMELINE   // share to Timeline
            }, function () {
              this.alertCtrl.create({
                title: "",
                message: "帖子已分享给好友！",
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            }, function (reason) {
              this.alertCtrl.create({
                title: "",
                message: reason,
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            });
          }
        },
        {
          cssClass:'btn-moment',
          handler: () => {
            Wechat.share({
              message: {
                title: productData.name,
                description: "This is description.",
                thumb: this.imageUrl+this.productImage[0],
                media: {
                  type: Wechat.Type.LINK,
                  webpageUrl: "pjapp://pjdarenapp.com"
                }
              },
              scene: Wechat.Scene.MOMENT   // share to Timeline
            }, function () {
              this.alertCtrl.create({
                title: "",
                message: "帖子已分享到微信朋友圈！",
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            }, function (reason) {
              this.alertCtrl.create({
                title: "",
                message: reason,
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            });
          }
        },
        {
          cssClass:'btn-weibo',
          handler: () => {
            let args :any = {};
            args.url = 'pjapp://pjdarenapp.com';
            args.title = productData.name;
            args.description = 'ThisisaCordovaPlugin';
            args.image = this.imageUrl+this.productImage[0];
            WeiboSDK.shareToWeibo(function () {
              this.alertCtrl.create({
                title: "",
                message: "帖子已分享到微博！ ",
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            }, function (reason) {
              this.alertCtrl.create({
                title: "",
                message: reason,
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            }, args);
          }
        },
        {
          cssClass :this.productData.liked == true ? 'btn-collection' : 'btn-collection',
          handler: () => {
            if(this.productData.liked == false || typeof this.productData.liked == 'undefined'){
              if(!GlobalVariable.isAuthUser){
                this.alertCtrl.create({
                  title: "",
                  message: "你必须登录才能看到此页面",
                  cssClass: 'okcancel',
                  buttons: ["确定"]
              }).present();
                this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
              }else{
                this.UserService.addLike(this.productData.id,"/products",true).subscribe(res =>{
                  this.productData.liked = 1;
                });
              }
            }else{
              if(!GlobalVariable.isAuthUser){
                this.alertCtrl.create({
                  title: "",
                  message: "你必须登录才能看到此页面",
                  cssClass: 'okcancel',
                  buttons: ["确定"]
              }).present();
                this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage),{from: "reg"};
              }else{
                this.UserService.removeLike(this.productData.id,"/products",true).subscribe(res =>{
                  this.productData.liked = 0;
                });
              }
            }
          }
        },
        {
          cssClass:'btn-copy',
          handler: () => {
            this.clipboard.copy('从PJ应用程序复制链接');
            Util.showSimpleToastOnTop("数据已复制成功", this.toastCtrl);
          }
        },
        {
          cssClass:'btn-report-ugc',
          handler: () => {
            this.presentReportPrompt(this.productData);
          }
        },
        {
          role: 'cancel', // will always sort to be on the bottom
          cssClass: 'btn-cancel',
          text: "取消",
          icon: !this.platform.is('ios') ? null : null,
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ],
    });
    actionSheet.present();
  }

  goToProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }

  editReview(i:number)
  {
    this.navCtrl.push(CreateProductReviewPage,{reviewId:this.reviewList[i].id,productId:this.productId,reviewContent:this.reviewList[i].content,
      images:this.reviewList[i].imageArray,rating:this.reviewList[i].rating});
  }
  onReadLessReadMore1(data){
    console.log(data);
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
    }
  }
}
