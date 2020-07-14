import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {CommentPage} from "../comment/comment";
import {UgcDetailPage} from "../ugc-detail/ugc-detail";
import {Util} from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';

@IonicPage({
  segment: "profile/public/ugc/:userId"
})
@Component({
  selector: 'page-profile-my-ugc',
  templateUrl: 'profile-my-ugc.html',
})
export class ProfileMyUgcPage {

  pageTitle: string;
  imageUrl: string;
  userData: any;
  userId: any;
  socialProfilePic: string;
  restListDataOdd: any = [];
  restListDataEven: any = [];
  page: number = 0
  lastPage=false;
  constructor(private navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              private httpService: HttpService,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.httpService.toggleLoader("ugc-loader",true);
    this.userId = navParams.get("userId");
    this.getUgcListByUserId();
    const title = navParams.get("title");
    this.pageTitle = !!title ? title : "粉丝专题";
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData = JSON.parse(localStorage.getItem("UserData"));

  }

  getUgcListByUserId() {
    return new Promise(resolve => {
      var data = []
      console.log("This page" + this.page)
      this.httpService.GetUgcByIdUserAndPage(this.userId, this.page+1).subscribe(res => {
        if(res.length == 0){
          this.lastPage = true;
        }
      });
      this.httpService.GetUgcByIdUserAndPage(this.userId, this.page).subscribe(res => {
        if(res.length == 0){
          this.lastPage = true;
          this.httpService.getAllImagesWithClassname("ugc-loader",'');
          return;
        }
        if(this.page == 0){
          this.httpService.getAllImagesWithClassname("ugc-loader",'page-profile-my-ugc');
        }
        for (let i = 0; i < res.length; i++) {
          if (res[i].user.recordStatus == "ACTIVE") {
            if (Number(res[i].likeCount) > 99999) res[i].likeCount = this.getCountStyle(res[i].likeCount.toString());
            data.push(res[i])
          }
        }
        data.forEach((d, index) => {
          if (index % 2 == 0) {
            this.restListDataEven.push(d)
          } else {
            this.restListDataOdd.push(d)
          }
        })
        resolve(true)
      },error =>{
        this.lastPage = true;
        if(this.page == 0){
          this.httpService.getAllImagesWithClassname("ugc-loader",'page-profile-my-ugc');
        }
      });
    })
  }

  incrementPage(infiniteScroll) {
    this.page = this.page + 1;
    this.getUgcListByUserId().then(data => {
      
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    })

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
    Util.unRegisterBackButton(this.platform, this.navCtrl)
  }

  /*Like UGC Data*/
  toggleLikeUp(item: any, pos: number, type: string) {
    this.httpService.addLike(item.id, "/ugc", true).subscribe(res => {
      if (type == "restListDataOdd") {
        this.restListDataOdd[pos].liked = true;
        if (this.restListDataOdd[pos].likeCount < 99998) this.restListDataOdd[pos].likeCount = this.restListDataOdd[pos].likeCount + 1;
      } else {
        this.restListDataEven[pos].liked = true;
        if (this.restListDataEven[pos].likeCount < 99998) this.restListDataEven[pos].likeCount = this.restListDataEven[pos].likeCount + 1;
      }
    });

  }

  /*Dislike UGC Data*/
  toggleLikeDown(item: any, pos: number, type: string) {
    this.httpService.removeLike(item.id, "/ugc", true).subscribe(res => {
      if (type == "restListDataOdd") {
        this.restListDataOdd[pos].liked = false;
        if (this.restListDataOdd[pos].likeCount < 99999) this.restListDataOdd[pos].likeCount = this.restListDataOdd[pos].likeCount - 1;
      } else {
        this.restListDataEven[pos].liked = false;
        if (this.restListDataEven[pos].likeCount < 99999) this.restListDataEven[pos].likeCount = this.restListDataEven[pos].likeCount - 1;
      }
    });
  }


  goToUserProfile(user: any) {
    if (user.id == localStorage.getItem("UserData.userId")) {
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    } else {
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }

  ugcComment(item: any) {
    this.navCtrl.push(CommentPage, {id: item});
  }

  /*Will view UGC in detail Page*/
  gotoNext(item, id, status) {
    this.navCtrl.push(UgcDetailPage, {
      item: item,
      id: id,
      status: status
    });
  }
}
