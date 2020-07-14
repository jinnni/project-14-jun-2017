import {Component} from '@angular/core';
import {IonicPage, NavParams, Platform, NavController} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {Util} from "../../global/util";
import {GlobalVariable} from "../../global/global.variable";
import { SettingsProvider } from '../../providers/settingsProvider';
import { UgcDetailPage } from '../ugc-detail/ugc-detail';

@IonicPage({
  segment: "profile/public/"
})
@Component({
  selector: 'page-profile-my-like',
  templateUrl: 'profile-my-like.html',
})
export class ProfileMyLikePage {

  pageTitle: string;
  imageUrl: string;
  userData: string;
  socialProfilePic: string;
  favoriteUgcListEven: any = [];
  favoriteUgcListOdd: any = [];
  isGuestUser: any;
  pageNo: number = 0;
  firsttime = true;
  lastPage = false;
  constructor(public navParams: NavParams,
              public navCtrl: NavController,
              public platform: Platform,
              private httpService: HttpService,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.httpService.toggleLoader("ugc-loader",true);
    const title = navParams.get("title");
    this.pageTitle = !!title ? title : "关注";
    if (GlobalVariable.isAuthUser) {
      this.isGuestUser = true;
    } else {
      this.isGuestUser = false;
    }
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.getFavoriteUgcList();
  }

  getFavoriteUgcList() {
    return new Promise(resolve => {
      this.httpService.GetFavoriteUgcListPagination(true,this.pageNo+1).subscribe(res => {
        if(res.length == 0){
          this.lastPage = true;
          this.httpService.getAllImagesWithClassname("ugc-loader",'');
        }
      });
      this.httpService.GetFavoriteUgcListPagination(true,this.pageNo).subscribe(res => {
        console.log(res);
        if(res.length == 0){
          this.lastPage = true;
          this.httpService.getAllImagesWithClassname("ugc-loader",'');
          return;
        }
        for (let i = 0; i < res.length; i++) {
          if (res[i].user.recordStatus == "ACTIVE") {
            if (Number(res[i].likeCount) > 99999) res[i].likeCount = this.getCountStyle(res[i].likeCount.toString());
            if (i % 2 == 0) {
              this.favoriteUgcListEven.push(res[i]);
            } else {
              this.favoriteUgcListOdd.push(res[i]);
            }
          }
        }
        if(this.firsttime == true || this.pageNo == 0){
          this.httpService.getAllImagesWithClassname("ugc-loader",'page-profile-my-like');
        }
      },error =>{
        if(this.firsttime == true || this.pageNo == 0){
          this.httpService.getAllImagesWithClassname("ugc-loader",'page-profile-my-like');
        }
      });
    })
  }
  incrementUgcPage(infiniteScroll) {
    this.firsttime = false;
    this.pageNo = this.pageNo + 1;
    this.getFavoriteUgcList().then(data => {
      infiniteScroll.complete();
    })

  }
  toggleLikeUp(item: any, pos: number, type: string) {
    this.httpService.addLike(item.id, "/ugc", true).subscribe(res => {
      if (type == "featureListOdd") {
        this.favoriteUgcListOdd[pos].liked = true;
        if(this.favoriteUgcListOdd[pos].likeCount<=99998) this.favoriteUgcListOdd[pos].likeCount = this.favoriteUgcListOdd[pos].likeCount + 1;
      }else if (type == "featureListEven") {
        this.favoriteUgcListEven[pos].liked = true;
        if(this.favoriteUgcListEven[pos].likeCount<=99998) this.favoriteUgcListEven[pos].likeCount = this.favoriteUgcListEven[pos].likeCount + 1;
      }
    });
  }
  toggleLikeDown(item: any, pos: number, type: string) {
    this.httpService.removeLike(item.id, "/ugc", true).subscribe(res => {
      if (type == "featureListOdd") {
        this.favoriteUgcListOdd[pos].liked = false;
        if(this.favoriteUgcListOdd[pos].likeCount<=99999) this.favoriteUgcListOdd[pos].likeCount = this.favoriteUgcListOdd[pos].likeCount - 1;
      }else if (type == "featureListEven") {
        this.favoriteUgcListEven[pos].liked = false;
        if(this.favoriteUgcListEven[pos].likeCount<=99999) this.favoriteUgcListEven[pos].likeCount = this.favoriteUgcListEven[pos].likeCount - 1;
      }
    });
  }
  getCountStyle(count: any) {
    if (Number(count) < 1000000) {
      let countText = (Number(count) / 1000 | 0) + 'k';
      return countText;
    }
    else {
      let countText = (Number(count) / 1000000).toString();
      if (countText.indexOf('.') !== -1) {
        countText = countText.substr(0, countText.indexOf('.') + 2) + 'M';
      } else {
        countText = countText.length > 3 ? countText.substring(0, 3) : countText + 'M';
      }
      return countText;
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
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform, this.navCtrl)
  }
  gotoNext(item,id,status){
   this.navCtrl.push(UgcDetailPage,{'id':id,'status':status,'item':item});
  }
  
}
