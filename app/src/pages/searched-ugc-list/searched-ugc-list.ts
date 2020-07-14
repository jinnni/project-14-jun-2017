import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, Platform } from 'ionic-angular';
import { HttpService } from '../../services/httpService';
import { UgcDetailPage } from '../../pages/ugc-detail/ugc-detail';
import { GlobalVariable } from '../../global/global.variable';
import { SignInUpPage } from '../../pages/sign-in-up/sign-in-up';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-searched-ugc-list',
  templateUrl: 'searched-ugc-list.html',
})
export class SearchedUgcListPage {
  list:any;
  searchUgcList:any;
  searchtext:string;
  imageUrl:string;
  featureListOdd: any;
  featureListEven: any;
  isGuestUser: boolean;
  userData:any;
  socialProfilePic:string;
  lastPage:boolean = false;
  pageNo = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public appCtrl: App,
    public platform: Platform,
    private settingsProvider:SettingsProvider,
    private alertCtrl: AlertController,
    public dataService:HttpService) {
    this.dataService.toggleLoader("ugc-loader",true);
    this.list = navParams.get("list");
    this.searchtext = navParams.get("title");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    if (!GlobalVariable.isAuthUser) {
      this.isGuestUser = false;
    } else {
      this.isGuestUser = true;
    }
  }
  doInfinite(infiniteScroll) {
    this.pageNo = this.pageNo + 1;
    let pushOdd = false;
    this.searchUgcList=[];
    this.dataService.SearchUGCObject(this.searchtext,this.pageNo).subscribe(res => {
      if (res.length < 1){this.lastPage = true;}
      this.searchUgcList = res;
      for (let index = 0; index < this.searchUgcList.length; index++) {
        if (this.searchUgcList[index].user.recordStatus == "ACTIVE") {
          if (Number(this.searchUgcList[index].likeCount) > 99999)
            this.searchUgcList[index].likeCount = this.getCountStyle(this.searchUgcList[index].likeCount.toString());
          let isInsert = true;
          if (this.searchUgcList[index].hasOwnProperty('timelineContent')) {
            isInsert = this.searchUgcList[index].timelineContent != "ARTICLE"
          }
          if (isInsert) {
            if (pushOdd == true) {
              this.featureListEven.push(this.searchUgcList[index]);
              pushOdd = false;
            } else {
              this.featureListOdd.push(this.searchUgcList[index]);
              pushOdd = true;
            }
          }
        }
      }
    });
    infiniteScroll.complete();
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
    new Promise((resolve,reject) => {
      resolve();
    }).then(sourceType =>{
      this.featureListEven = [];
      this.featureListOdd = [];
      this.searchUgcList = [];
      let pushOdd = false;
      this.dataService.SearchUGCObject(this.searchtext,this.pageNo+1).subscribe(resp => {
        if (resp.length < 1){this.lastPage = true;}
      });
      this.dataService.SearchUGCObject(this.searchtext,this.pageNo).subscribe(res => {
        this.searchUgcList = res;
        for (let index = 0; index < this.searchUgcList.length; index++) {
          if (this.searchUgcList[index].user.recordStatus == "ACTIVE") {
            if (Number(this.searchUgcList[index].likeCount) > 99999)
              this.searchUgcList[index].likeCount = this.getCountStyle(this.searchUgcList[index].likeCount.toString());
            let isInsert = true;
            if (this.searchUgcList[index].hasOwnProperty('timelineContent')) {
              isInsert = this.searchUgcList[index].timelineContent != "ARTICLE"
            }
            if (isInsert) {
              if (pushOdd == true) {
                this.featureListEven.push(this.searchUgcList[index]);
                pushOdd = false;
              } else {
                this.featureListOdd.push(this.searchUgcList[index]);
                pushOdd = true;
              }
            }
          }
        }
        if(this.pageNo == 0){
          this.dataService.getAllImagesWithClassname("ugc-loader",'page-searched-ugc-list');
        }
      },error =>{
        if(this.pageNo == 0){
          this.dataService.getAllImagesWithClassname("ugc-loader",'page-searched-ugc-list');
        }
      });
    });
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
      this.dataService.addLike(item.id, "/ugc", true).subscribe(res => {
        if (type == "featureListOdd") {
          this.featureListOdd[pos].liked = true;
          if(this.featureListOdd[pos].likeCount<=99998) this.featureListOdd[pos].likeCount = this.featureListOdd[pos].likeCount + 1;
        }else if (type == "featureListEven") {
          this.featureListEven[pos].liked = true;
          if(this.featureListEven[pos].likeCount<=99998) this.featureListEven[pos].likeCount = this.featureListEven[pos].likeCount + 1;
        }
      });
    }
  }

  toggleLikeDown(item: any, pos: number, type: string) {
    if (!GlobalVariable.isAuthUser) {
      this.alertCtrl.create({
        title: "",
        message: "",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    } else {
      this.dataService.removeLike(item.id, "/ugc", true).subscribe(res => {
        if (type == "featureListOdd") {
          this.featureListOdd[pos].liked = false;
          if(this.featureListOdd[pos].likeCount<=99999) this.featureListOdd[pos].likeCount = this.featureListOdd[pos].likeCount - 1;
        }else if (type == "featureListEven") {
          this.featureListEven[pos].liked = false;
          if(this.featureListEven[pos].likeCount<=99999) this.featureListEven[pos].likeCount = this.featureListEven[pos].likeCount - 1;
        }
      });
    }
  }

  goToProfile(user: any) {
    if (user.id == localStorage.getItem("UserData.userId")) {
      this.navCtrl.parent.select(4);
    } else {
      // below comment will be revert in future
      // this.anavCtrl.push(ProfilePublicPage, { userData: user });
    }
  }
  GoDetail(item, id, status) {
    this.navCtrl.push(UgcDetailPage, {
      item: item,
      id: id,
      status: status
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
}
