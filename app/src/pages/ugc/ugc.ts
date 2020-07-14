import { Component, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Content, IonicPage, NavController, Slides, Platform, ToastController, App, AlertController} from "ionic-angular";
import { SettingsProvider } from "../../providers/settingsProvider";
import { Product } from "../../data/product.interface";
import { UgcCreatePage } from "../ugc-create/ugc-create";
import { UgcDetailPage } from "../ugc-detail/ugc-detail";
import { HttpService } from "../../services/httpService";
import { CommentPage } from "../comment/comment";
import { GlobalVariable } from "../../global/global.variable";
import { SignInUpPage } from "../sign-in-up/sign-in-up";
import { NativePageTransitions, NativeTransitionOptions } from '@ionic-native/native-page-transitions';
import {Util} from "../../global/util";
import {FormControl} from "@angular/forms";
import { ProductDetailPage } from '../product-detail/product-detail';
import { ProfilePublicPage } from '../profile-public/profile-public';
import { SearchedUgcListPage } from '../../pages/searched-ugc-list/searched-ugc-list';
import { SearchListPage } from '../../pages/search-list/search-list';
import { FollowerUgcReviewPage } from '../../pages/follower-ugc-review/follower-ugc-review';
declare let MediaPicker;
@IonicPage({
  segment: "ugc"
})
@Component({
  selector: 'page-ugc',
  templateUrl: 'ugc.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class UgcPage {
  @ViewChild(Content) content: Content;
  selectedUgcTab: number;
  productList: Product[];
  groupedProductList;

  uptodateDateWiseListOdd: any = [];
  uptodateDateWiseListEven: any = [];
  hotPostsLikeWiseListOdd: any = []
  hotPostsLikeWiseListEven: any = []
  featureListOdd: any = [];
  featureListEven: any = [];
  lastcheck: boolean;
  hotpost: boolean;
  feature: boolean;

  newProducts: any;
  Products: any;
  userData: any;
  imageUrl: any;
  socialProfilePic: any;
  isGuestUser: boolean;
  lastPage: boolean = false;
  isScroll:boolean;
  pageNoFeatured: number = 0;
  pageNoHotPost: number = 0;
  pageNoUpToDate: number = 0;
  element: any = {};
  public images: any = [];
  maxPictureCount = 9;
  slideImages:any=[];
  panelPos1 : number ;
  panelPos2 : number ;
  panelPos3 : number ;
  public pageSubTabs: any;
  public pageTabs: any;
  @ViewChild('slider') slider: Slides;
  page = 0;
  public scrollAmount = 0;
  slideZoomOne : any;
  slideZoomTwo : any;
  slideZoomThree : any;
  counter : number = 0;
  ugcSearchList: any;
  ugcCollection:any;
  finalUgcCollection:any;
  finalUgcCollectionSimilar:any;
  ugcCollectionLength: any;
  searchTerm: string = '';
  searchBarControl: FormControl;
  searching: any = false;
  blank: any = true;
  totPg:any;
  clickedIndex;
  constructor(private settingsProvider: SettingsProvider,
              public UserService: HttpService,
              private navCtrl: NavController,public appCtrl: App,
              public platform:Platform,
              public toastCtrl:ToastController,
              private alertCtrl: AlertController,
              private changeDetectorRef: ChangeDetectorRef,
              private nativePageTransitions: NativePageTransitions) {
    this.UserService.toggleLoader("ugc-loader",true);
    this.searchBarControl = new FormControl();
    this.settingsProvider.currentTab = 1;
    this.feature = true;
    this.selectedUgcTab = 0; 
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.pageTabs = "tab0";
    if (!GlobalVariable.isAuthUser) {
      this.isGuestUser = false;
    } else {
      this.isGuestUser = true;
    }
    this.getUGCBanner();
  }
  searchPage1(){
    this.settingsProvider.isMenuOpened = false;
    this.settingsProvider.isActivate = true;
    this.settingsProvider.currentPageRefresh = "search";
    this.navCtrl.push(SearchListPage,{},{animate:false});
  }
  doUGCRefresh(refresher) {
    this.pageNoFeatured = 0;
    this.lastPage = false; 
    this.initialDataLoadingAndOperations();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }
  ionViewDidLoad(){
    this.settingsProvider.isMenuOpened = false;
    this.getUGCBanner();
    this.initialDataLoadingAndOperations();
    this.changeDetectorRef.detectChanges();
  }
  initialDataLoadingAndOperations(){
    this.getFeaturedUGC(this.pageNoFeatured,16);
    this.slider.lockSwipes(true);
  }
  getUGCBanner(){
    this.UserService.GetUGCBanner().subscribe(res => {
      this.slideImages = [];
      for(let i=0; i<res.length; i++)
      {
        this.slideImages[i] = (res[i]);
        this.slideImages[i].imageName=localStorage.getItem("myImageUrl")+res[i].imageName;
      }
    })
  }
  scrollHandler(event) {
    if(event.scrollTop > 700){
      this.isScroll = true;
    }else{
      this.isScroll = false;
    }
    this.changeDetectorRef.detectChanges();
  }
  scrollTop(){
    this.content.scrollToTop(1200);
    this.isScroll = false;
  }

  ionViewWillEnter(){
    Util.registerBackButton(this.platform,this.counter,this.toastCtrl);
  }

  selectedTab(index) {
    setTimeout(() => {
      let element1 = document.querySelector("#tab_1");
      element1.classList.add("selected");
      element1.classList.add("segment-activated");
      let element2 = document.querySelector("#tab_2");
      element2.classList.remove("selected");
      element2.classList.remove("segment-activated");
    }, 1000);
    
    if (index == 0) {
      this.feature = true;
      this.hotpost = false;
    }
    if (index == 1) {
      this.feature = false;
      this.hotpost = true;
      this.navCtrl.push(FollowerUgcReviewPage);
    }
  }
  
  backClickTab(){
    this.selectedUgcTab = 0;
    this.pageTabs = "tab0";
    this.feature = true;
    this.hotpost = false;
    this.slider.slideTo(0);
  }
  getInnerText(dom){
    let regex = /(<([^>]+)>)/ig;
    let body = dom;
    let result = body.replace(regex, " ");
    result = result.replace(/<img[^>]*>/g," ");
    result = result.replace(/[？。、：，,.]+/g," ");
    result = result.replace(/\s+/g, " ");
    result = result.replace(/&nbsp;/g,"");
    return result;
  }
  splitContent(content){
    let splitted = content.split(/[，,.]+/);
    return splitted;
  }
  getFeaturedUGC(pageNo:number, size)  {
    this.ugcSearchList = [];
    this.UserService.GetUGCListPageInfoSize(true, pageNo, size).subscribe(resp => {
      let res = resp.content;
      if(res.length > 0){
        this.totPg = resp.totalPages - 1;
      }else{
        this.totPg = resp.totalPages;
      }
      let pushOdd = false;
      for (let i = 0; i < res.length; i++) {
        this.ugcSearchList.push(res[i]);
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
          this.ugcSearchList[i] = {"title":this.getInnerText(res[i].title +" ( "+res[i].content+" )" ),"detail":res[i]};
        }
      }
      if(pageNo == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-ugc');
      }
      if (res.length < 1)
      {
        this.pageNoFeatured = this.pageNoFeatured - 1;
        this.lastPage = true;
        this.UserService.getAllImagesWithClassname("ugc-loader",'');
      }
      this.changeDetectorRef.detectChanges();
    },error =>{
      if(this.isGuestUser == false){
        console.log(this.isGuestUser );
        if(pageNo == 0){
          this.UserService.getAllImagesWithClassname("ugc-loader",'page-ugc');
        }
      }
      this.UserService.getAllImagesWithClassname("ugc-loader",'');
    });
    this.setFilteredItems();
    this.searchBarControl.valueChanges.debounceTime(700).subscribe(search => {
      this.blank = false;
      this.searching = false;
      this.setFilteredItems();
      if(this.searchTerm == ''){
        this.blank = true;
      }
    });
  }
  filterSearch(list,searchTerm){
    return list.filter((item) => {
      if(item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){
        return item;
      }
    });
  }
  filterSearchNew(list,searchTerm){
    return list.filter((item) => {
      let c = this.filterer(item.title,searchTerm);
      item.term = c;
      return item;
    });
  }
  filterer(value:string, similarText:string){
    let x = value.replace(/\s+/g, " ").trim();
    let y = x.split(" ");
    var regEx = new RegExp(similarText, 'gi');
    for(let index = 0; index < y.length; index++){   
      if(regEx.test(y[index]) == true){
        value = y[index];
        break;
      }
      else{
        value = "";
      }
    }
    return value;
  }
  ultraFilter(collection){
    let coll = [];
    for(let i in collection){
      if(collection[i].term != ""){
        coll.push(collection[i]);
      }
    }
    return coll;
  }
  groupObject(collection,searchTerm){
    let y = [];
    let z = [];
    for(let x in collection){
      if(collection[x].term != ""){
        y.push(collection[x]);
      }
    }
    z.push([searchTerm,y]);
    return z;
  }
  onSearch(){
    this.searching = true;
  }
  combineDuplicateObject(collection){
    let consolidate = [];
    let groupDuplicates = function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };
    let groupedSearch = groupDuplicates(collection, 'title')
    for (let prop in groupedSearch ) {consolidate.push([prop, groupedSearch[prop]]);}
    return consolidate;
  }
  consolidateObjects(collection){
    let consolidateSimilar = [];
    let groupDuplicates = function(coll, title) {
      return coll.reduce(function(val, item) {
        (val[item[title]] = val[item[title]] || []).push(item);
        return val;
      }, {}); 
    };
    let groupedSearchSimilar = groupDuplicates(collection, 'term');
    for (let prop in groupedSearchSimilar) {
      consolidateSimilar.push([prop, groupedSearchSimilar[prop]]);
    }
    return consolidateSimilar;
  }
  setFilteredItems() {
    this.ugcCollection = this.filterSearchNew(this.ugcSearchList,this.searchTerm);
    this.finalUgcCollectionSimilar = this.consolidateObjects(this.ultraFilter(this.ugcCollection));
    this.finalUgcCollection = this.groupObject(this.ugcCollection,this.searchTerm);
    this.ugcCollectionLength = this.finalUgcCollection[0][1].length;
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

  GoDetail(item, id, status) {
    this.navCtrl.push(UgcDetailPage, {
      item: item,
      id: id,
      status: status
    });
  }

  showUgcCreate() {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.navCtrl.push(UgcCreatePage);
    }
  }

  showImageGallary(){
    var args = {
      'selectMode': 100,
      'maxSelectCount': (9 - this.images.length),
      'maxSelectSize': 188743680,
    };
    MediaPicker.getMedias(args, (medias) => {
      console.log(medias)
      for (let i = 0; i < medias.length; i++) {
        if (this.images.length < 9) {
          this.images.push(medias[i].uri);
        }
      };
      this.navCtrl.push(UgcCreatePage,{imagesArr:this.images});
      this.images = [];
    }, (e) => {
      console.log(e)
    })
  }

  showUgcDetail(list, status) {
    this.UserService.GetUGCById(list[0].id).subscribe(res => {
      this.navCtrl.push(UgcDetailPage, {item: res,id: res.id,status: "none"});
    });
  }

  showUgcList(list){
    this.navCtrl.push(SearchedUgcListPage,{title:this.searchTerm,list:list});
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

  ugcComment(ugcId: number) {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.navCtrl.push(CommentPage, { id: ugcId });
    }
  }

  goToProfile(user: any) {
    if (user.id == localStorage.getItem("UserData.userId")) {
      this.navCtrl.parent.select(4);
    } else {
      this.navCtrl.push(ProfilePublicPage, { userData: user });
    }
  }

  ionViewWillLeave() {
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
}