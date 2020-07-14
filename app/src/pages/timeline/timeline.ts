import {Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef} from '@angular/core';
import {IonicPage, NavController,ToastController, Content, Platform, LoadingController, App, AlertController, Slides} from 'ionic-angular';
import {ProductCategoryPage} from "../product-category/product-category";
import {ProductDetailPage} from "../product-detail/product-detail";
import {CommentPage} from "../comment/comment";
import {Product} from "../../data/product.interface";
import {ProductListPage} from "../product-list/product-list";
import {GlobalVariable} from "../../global/global.variable";
import {UgcDetailPage} from "../ugc-detail/ugc-detail";
import {ArticleDetailPage} from "../article-detail/article-detail";
import {HttpService} from "../../services/httpService";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import {Util} from "../../global/util";
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import { SettingsProvider } from '../../providers/settingsProvider';
import { SearchListPage } from '../search-list/search-list';
import { ProfilePublicPage } from '../profile-public/profile-public';
import { FollowerUgcReviewPage } from '../follower-ugc-review/follower-ugc-review';
import { StatusBar } from '@ionic-native/status-bar';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { from } from 'rxjs/observable/from';
import {File} from '@ionic-native/file';
import {FileTransfer, FileTransferObject} from "@ionic-native/file-transfer";
import { PhotoLibrary, AlbumItem } from '@ionic-native/photo-library';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { a } from '@angular/core/src/render3';
declare let PjPlugin:any;
@IonicPage({
  segment: "timeline/:username"
})
@Component({
  selector: 'page-timeline',
  templateUrl: 'timeline.html',
  changeDetection: ChangeDetectionStrategy.Default
})

export class TimeLinePage {
  @ViewChild('slider') slider: Slides;
  @ViewChild('slides') slides: Slides;
  @ViewChild('productSlider') productSlider: Slides;
  @ViewChild(Content) content: Content;
  @ViewChild('banner') banner: any;

  @ViewChild('myswiper' ) myswiper?: SwiperComponent;
  @ViewChild('myswiper' ) myswiper1?: SwiperComponent;

  newProducts: any; // Six Items pending to implement
  Products:any;
  groupedProductList;
  ugcList:any;
  ugcListx:any=[];
  allList:any=[];
  CatData :any;
  userData:any = {};
  userAuth:boolean;
  lastPage:boolean;
  isScroll:boolean;
  imageUrl:string;
  socialProfilePic:string;
  slideImages:any=[];
  messageCount:number;
  boxTrackCount:number;
  otherCount:number;
  isGuestUser:boolean;
  page:number=0;
  public counter=0;
  userId:any;
  totPg:any;
  selectedUgcTab: number;
  uptodateDateWiseListOdd: any = [];
  uptodateDateWiseListEven: any = [];
  hotPostsLikeWiseListOdd: any = []
  hotPostsLikeWiseListEven: any = []
  featureListOdd: any = [];
  featureListEven: any = [];
  hotpost: boolean;
  feature: boolean;
  pageNoFeatured: number = 0;
  public pageTabs: any;
  isCollapse = false;
  bgColor;
  bgColorArray = [];
  autoplay = 4000;
  product_slider_config: SwiperConfigInterface = {
    a11y: true,
   direction: 'horizontal',
   slidesPerView: 4,
   keyboard: true,
   noSwiping: true,
   loop: false,
   mousewheel: true,
   scrollbar: false,
   navigation: false,
   pagination: false,
};
  constructor(public navCtrl: NavController,public appCtrl: App,
              public platform: Platform,
              public toastCtrl:ToastController,private alertCtrl: AlertController,
              public loadingCtrl:LoadingController,
              private nativePageTransitions: NativePageTransitions,
              public UserService:HttpService,
              private changeDetectorRef: ChangeDetectorRef,
              private statusBar: StatusBar,
              private transfer: FileTransfer,
              private httpService: HttpService,
              private file: File,
              public photolib: PhotoLibrary,
              private settingsProvider: SettingsProvider) {


    this.settingsProvider.statusBar = this.statusBar;
    this.settingsProvider.statusBar.styleLightContent();
    this.settingsProvider.currentTab = 0;
    this.userAuth = GlobalVariable.isAuthUser;
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.userId = localStorage.getItem("UserData.userId");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    if(this.userData == null){
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage);
    }
    if(!GlobalVariable.isAuthUser){
      this.isGuestUser =false;
    }else{
      this.isGuestUser =true;
    }
    this.feature = true;
    this.selectedUgcTab = 0; 
    this.pageTabs = "tab0";
  }
  onSlideLoad(event){
   // let index = event.getActiveIndex();
   // console.log('Slides Index Change: ', + index )
    this.slides.startAutoplay();
  }
  sliderDidReachEnd(event){
    this.slides.startAutoplay();
  }

  onSlideIndexChange(index: number){
    if(this.settingsProvider.showSearch){
      this.statusBar.backgroundColorByHexString('#ff2744');
    }else{
    this.bgColor = this.bgColorArray[index];
    this.statusBar.backgroundColorByHexString(this.bgColor);
    this.settingsProvider.statusbarColor = this.bgColor;
    }
  }
  onProductSlideChange(event){
    this.productSlider.startAutoplay();
  }
  getUserRestrictionInfo() {
    this.UserService.GetUserRestrictionStatus().subscribe(resp => {
      this.settingsProvider.setUserStatus(resp);
    },e =>{
      let resp = {
        "ugc": true,
        "productReview": true,
        "ugcComments": true,
        "articleComments": true,
        "productDetailQuestion": true,
        "productDetailAnswer": true,
      }
      this.settingsProvider.setUserStatus(resp);
    });
  }
  productLoad(){
    this.UserService.GetFeatureProducts().subscribe(res =>{
      let countproduct=0;
      this.Products = res;
      this.newProducts=[];
      for(let item of this.Products ){
        item.shortName = item.name.substring(0,13);
        this.newProducts[countproduct]=item;
        countproduct++;
      }
    });
  }

  onMySlideInit(event){
    this.settingsProvider.slider = this.myswiper.directiveRef;
  }
  onMyProductSlideInit(){
    this.settingsProvider.productSlider = this.myswiper1.directiveRef;
  }
  bannerLoad(){
    this.statusBar.backgroundColorByHexString('#ffffff')
    this.UserService.GetBanner().subscribe(res => {
      this.slideImages = [];
      for(let i=0; i<res.length; i++){
        this.slideImages[i] = (res[i]);
       if(res[i].bgColor == undefined){
           res[i]['bgColor'] = '#ffffff';
         }
        this.bgColorArray[i] = res[i].bgColor;
        this.slideImages[i].imageName=localStorage.getItem("myImageUrl")+res[i].imageName;
      }
      this.bgColor = res[0].bgColor;
      this.statusBar.backgroundColorByHexString(this.bgColor )
    })
  }
  getFeaturedUGC(pageNo:number, size)  {
    this.slider.lockSwipes(true);
    this.UserService.GetUGCListPageInfoSize(true, pageNo, size).subscribe(resp => {
      if(pageNo == 0){
        this.featureListEven = [];
        this.featureListOdd = [];
      }
      let res = resp.content;
      if(res.length > 0){
        this.totPg = resp.totalPages - 1;
      }else{
        this.totPg = resp.totalPages;
      }
      let pushOdd = false;
      for (let i = 0; i < res.length; i++) {
        if (res[i].user.recordStatus == "ACTIVE") {
          if (Number(res[i].likeCount) > 99999) res[i].likeCount = this.getCountStyle(res[i].likeCount.toString());
          let isInsert = true;
          if (res[i].hasOwnProperty('timelineContent')) {
            isInsert = res[i].timelineContent != "ARTICLE"
          }
          if (isInsert) {
            if (pushOdd == true) {
              this.featureListEven.push(res[i]);
              pushOdd = false;
            } else {
              this.featureListOdd.push(res[i]);
              pushOdd = true;
            }

          }
        }
      }

    //  this.UserService.getAllImagesWithClassname("ugc-loader",'page-timeline');
   

    if(pageNo == 0){
      setTimeout(() => {
        this.UserService.isTimeLnePage = false
        this.UserService.toggleLoader('ugc-loader', false);     
      },2000);
    }

      if (res.length < 1)
      {     
        this.pageNoFeatured = this.pageNoFeatured - 1;
        this.lastPage = true;
        this.UserService.toggleLoader('ugc-loader', false);     
      }
      this.changeDetectorRef.detectChanges();
    },error =>{
      this.UserService.isTimeLnePage = false
      if(this.isGuestUser == false){
        if(pageNo == 0){
          this.UserService.toggleLoader('ugc-loader', false);    
        }
      }
      this.UserService.toggleLoader('ugc-loader', false);   
   
    });
  }
  selectedTab(index) {
    if (index == 0) {
      this.feature = true;
      this.hotpost = false;
    }
    if (index == 1) {
      this.feature = false;
      this.hotpost = true;
      this.navCtrl.push(FollowerUgcReviewPage).then(()=>{
        this.selectedUgcTab = 0;
        this.pageTabs = "tab0";
      });
    }
  }
  backClickTab(){
    this.selectedUgcTab = 0;
    this.pageTabs = "tab0";
    this.feature = true;
    this.hotpost = false;
    this.slider.slideTo(0);
  }
  showProduct(productItem: Product) {
    this.navCtrl.push(ProductDetailPage, {
      item: productItem,
      id:productItem.id
    });
  }
  GoDetail(item, id, status) {
    this.navCtrl.push(UgcDetailPage, {
      item: item,
      id: id,
      status: status
    });
  }
  goToProfile(user: any) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else if (user.id == localStorage.getItem("UserData.userId")) {
      this.navCtrl.parent.select(4);
    } else {
      this.navCtrl.push(ProfilePublicPage, { userData: user });
    }
  }
  toggleLikeUp(item: any, pos: number, type: string) {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.UserService.addLike(item.id, "/ugc", true).subscribe(res => {
        if (type == "featureListOdd") {
          this.featureListOdd[pos].liked = true;
          if(this.featureListOdd[pos].likeCount<=99998) this.featureListOdd[pos].likeCount = this.featureListOdd[pos].likeCount + 1;
        }else if (type == "featureListEven") {
          this.featureListEven[pos].liked = true;
          if(this.featureListEven[pos].likeCount<=99998) this.featureListEven[pos].likeCount = this.featureListEven[pos].likeCount + 1;
        } else if (type == "uptodateDateWiseListOdd") {
          this.uptodateDateWiseListOdd[pos].liked = true;
          if(this.uptodateDateWiseListOdd[pos].likeCount<=99998) this.uptodateDateWiseListOdd[pos].likeCount = this.uptodateDateWiseListOdd[pos].likeCount + 1;
        } else if (type == "uptodateDateWiseListEven") {
          this.uptodateDateWiseListEven[pos].liked = true;
          if(this.uptodateDateWiseListEven[pos].likeCount<=99998) this.uptodateDateWiseListEven[pos].likeCount = this.uptodateDateWiseListEven[pos].likeCount + 1;
        } else if (type == "hotPostsLikeWiseListEven") {
          this.hotPostsLikeWiseListEven[pos].liked = true;
          if(this.hotPostsLikeWiseListEven[pos].likeCount<=99998) this.hotPostsLikeWiseListEven[pos].likeCount = this.hotPostsLikeWiseListEven[pos].likeCount + 1;
        }else{
          this.hotPostsLikeWiseListOdd[pos].liked = true;
          if(this.hotPostsLikeWiseListOdd[pos].likeCount<=99998) this.hotPostsLikeWiseListOdd[pos].likeCount = this.hotPostsLikeWiseListOdd[pos].likeCount + 1;
        }
      });
    }
  }
  toggleLikeDown(item: any, pos: number, type: string) {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.UserService.removeLike(item.id, "/ugc", true).subscribe(res => {
        if (type == "featureListOdd") {
          this.featureListOdd[pos].liked = false;
          if(this.featureListOdd[pos].likeCount<=99999) this.featureListOdd[pos].likeCount = this.featureListOdd[pos].likeCount - 1;
        }else if (type == "featureListEven") {
          this.featureListEven[pos].liked = false;
          if(this.featureListEven[pos].likeCount<=99999) this.featureListEven[pos].likeCount = this.featureListEven[pos].likeCount - 1;
        }else if (type == "uptodateDateWiseListOdd") {
          this.uptodateDateWiseListOdd[pos].liked = false;
          if(this.uptodateDateWiseListOdd[pos].likeCount<=99999) this.uptodateDateWiseListOdd[pos].likeCount = this.uptodateDateWiseListOdd[pos].likeCount - 1;
        } else if (type == "uptodateDateWiseListEven") {
          this.uptodateDateWiseListEven[pos].liked = false;
          if(this.uptodateDateWiseListEven[pos].likeCount<=99999) this.uptodateDateWiseListEven[pos].likeCount = this.uptodateDateWiseListEven[pos].likeCount - 1;
        } else if (type == "hotPostsLikeWiseListEven") {
          this.hotPostsLikeWiseListEven[pos].liked = false;
          if(this.hotPostsLikeWiseListEven[pos].likeCount<=99999) this.hotPostsLikeWiseListEven[pos].likeCount = this.hotPostsLikeWiseListEven[pos].likeCount - 1;
        }else{
          this.hotPostsLikeWiseListOdd[pos].liked = false;
          if(this.hotPostsLikeWiseListOdd[pos].likeCount<=99999) this.hotPostsLikeWiseListOdd[pos].likeCount = this.hotPostsLikeWiseListOdd[pos].likeCount - 1;
        }
      });
    }
  }
  toggleAddFavoriteList(item: any, pos: number, type: string) {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.UserService.addFavoriteUgc(item.id, "/ugc", true).subscribe(res => {
        if (type == "featureListOdd") {
          this.featureListOdd[pos].favourite = true;
        }else if (type == "featureListEven") {
          this.featureListEven[pos].favourite = true;
        } else if (type == "uptodateDateWiseListOdd") {
          this.uptodateDateWiseListOdd[pos].favourite = true;
        }else if (type == "uptodateDateWiseListEven") {
          this.uptodateDateWiseListEven[pos].favourite = true;
        }  else if (type == "hotPostsLikeWiseListOdd") {
          this.hotPostsLikeWiseListOdd[pos].favourite = true;
        }else{
          this.hotPostsLikeWiseListEven[pos].favourite = true;
        }
      });
    }
  }
  toggleRemoveFavoriteList(item: any, pos: number, type: string) {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.UserService.removeFavoriteUgc(item.id, "/ugc", true).subscribe(res => {
        if (type == "featureListOdd") {
          this.featureListOdd[pos].favourite = false;
        } else if (type == "featureListEven") {
          this.featureListEven[pos].favourite = false;
        }else if (type == "uptodateDateWiseListOdd") {
          this.uptodateDateWiseListOdd[pos].favourite = false;
        }else if (type == "uptodateDateWiseListEven") {
          this.uptodateDateWiseListEven[pos].favourite = false;
        }  else if (type == "hotPostsLikeWiseListOdd") {
          this.hotPostsLikeWiseListOdd[pos].favourite = false;
        }else{
          this.hotPostsLikeWiseListEven[pos].favourite = false;
        }
      });
    }
  }
  doRefresh(refresher) {
    this.myswiper.directiveRef.startAutoplay();
    this.myswiper1.directiveRef.startAutoplay();
    // this.slides.startAutoplay();
    this.settingsProvider.showSearch = false;
    this.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
    this.pageNoFeatured = 0;
    this.lastPage = false;
    this.getFeaturedUGC(this.pageNoFeatured,16);
    setTimeout(() => {
      refresher.complete();
    }, 200);
  }
  doInfiniteUGC(infiniteScroll) {
    this.pageNoFeatured = this.pageNoFeatured + 1;
    this.changeDetectorRef.detectChanges();
    setTimeout(() => {
      this.getFeaturedUGC(this.pageNoFeatured,16);
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 1000);
  }
  doInfiniteUGCClicking() {
    this.pageNoFeatured = this.pageNoFeatured + 1;
      this.getFeaturedUGC(this.pageNoFeatured,16);
  }
  scrollTop(){
    this.content.scrollToTop(1200);
    this.isScroll = false;
  }
  scrollHandler(event) {
    let elementHeight = this.banner.nativeElement.clientHeight;
    let maxHeight = Math.floor(elementHeight - 40);
    if(event.directionY == 'down' && event.scrollTop > maxHeight){
      // this.slides.stopAutoplay();
      this.myswiper.directiveRef.stopAutoplay();
      this.myswiper1.directiveRef.stopAutoplay();
      this.settingsProvider.showSearch = true;
      this.statusBar.backgroundColorByHexString('#ff2744');
    }
    if(event.directionY == 'up' && event.scrollTop <= maxHeight){
      // this.slides.startAutoplay();
      this.myswiper.directiveRef.startAutoplay();
      this.myswiper1.directiveRef.startAutoplay();
      this.settingsProvider.showSearch = false;
      this.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
    }
    if(event.scrollTop > maxHeight){
      this.isScroll = true;
      this.isCollapse = true;
    }
    if(event.scrollTop <= maxHeight){
      this.isScroll = false;
      this.isCollapse = false;
    }
    this.changeDetectorRef.detectChanges();
  }
  ionViewDidLoad(){
    this.settingsProvider.isMenuOpened = false;
    this.httpService.isTimeLnePage = true
    // this.UserService.toggleLoader("ugc-loader",true);
    if(this.settingsProvider.showSearch){
      this.statusBar.backgroundColorByHexString('#ff2744');
    }else{
      this.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
    }
    new Promise((r1,r2) => {
      r1();
    }).then(()=>{
      this.getUserRestrictionInfo();
    }).then(()=>{
      
      this.bannerLoad();
    }).then(()=>{
      this.productLoad();
    }).then(()=>{
      this.getFeaturedUGC(this.pageNoFeatured,16);
    });

  }
  ionViewDidEnter(){
    if(this.settingsProvider.showSearch){
      this.statusBar.backgroundColorByHexString('#ff2744');
    }else{
      this.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
      if(this.myswiper){
        this.myswiper.directiveRef.startAutoplay();
      }
      if(this.myswiper1){
        this.myswiper1.directiveRef.startAutoplay();
      }
    }
  }
  ionViewWillEnter(){
    if(this.settingsProvider.showSearch){
      this.statusBar.backgroundColorByHexString('#ff2744');
    }else{
      this.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
      if(this.myswiper){
        this.myswiper.directiveRef.startAutoplay();
       }
       if(this.myswiper1){
        this.myswiper1.directiveRef.startAutoplay();
       }
    }
    this.httpService.isTimeLnePage = true
    this.settingsProvider.statusBar.styleLightContent();
    let pageName = this.settingsProvider.getCurrentPage();
    if(pageName == "comment" || pageName == "public-profile"){
      this.pageNoFeatured = 0;
      this.lastPage = false; 
      this.getFeaturedUGC(this.pageNoFeatured,16);
    }
  }
  ionViewWillLeave() {
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.styleDefault();
    }else{
      this.settingsProvider.statusBar.styleLightContent();
    }
    this.settingsProvider.currentPageRefresh = "none";
    let options: NativeTransitionOptions = {
      direction: 'up',
      duration: 0,
      slowdownfactor: 0,
      slidePixels: 0,
      iosdelay: 0,
      androiddelay: 0,
      fixedPixelsTop: 0,
      fixedPixelsBottom: 0
    };
    this.nativePageTransitions.fade(options);
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
  searchPage(event){
    event.preventDefault();
    event.stopPropagation();
    this.settingsProvider.isMenuOpened = false;
    this.settingsProvider.isActivate = true;
    this.changeDetectorRef.detectChanges();
    this.settingsProvider.currentPageRefresh = "search";
    this.navCtrl.push(SearchListPage,{},{animate:false});
  }
}
