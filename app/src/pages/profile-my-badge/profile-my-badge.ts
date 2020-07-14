import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavParams, Platform, NavController, Slides, Content} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {Badge} from "../../data/badge.interface";
import { Util } from "../../global/util";
import {BadgeDetailPage} from "../badge-detail/badge-detail";
import { SettingsProvider } from '../../providers/settingsProvider';
import { StatusBar } from '@ionic-native/status-bar';
@IonicPage({
  segment: "profile/public/:userId"
})
@Component({
  selector: 'page-profile-my-badge',
  templateUrl: 'profile-my-badge.html',
})
export class ProfileMyBadgePage {

  @ViewChild(Content) content: Content;
  selectedBadgeTab: number;
  expertBadge: boolean;
  myBadge: boolean;
  badgeList;
  badgeList1;
  badgeListTemp;
  badgeListByUser: any;
  listIds: number[] = [];
  alllistIds: number[] = [];
  pageTitle: string;
  isUserBadge:boolean;
  currentScore:number;
  imageUrl:string;
  lastPage: boolean = false;
  panelPos1 : number ;
  panelPos2 : number ;
  pageNo:number = 0;
  UserId;
  selfId;
  public pageTabs: any;
  @ViewChild('slider') slider: Slides;
  page = 0;
  public scrollAmount = 0;
  constructor(private httpService: HttpService,
              public navCtrl: NavController,
              public platform:Platform,
              public navParams: NavParams,
              public statusBar: StatusBar,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.pageTabs = "tab0";
    const pageTitle = navParams.get("title");
    this.UserId = navParams.get("userId");
    this.selfId = localStorage.getItem("UserData.userId");
    this.pageTitle = !!pageTitle? pageTitle : "所有勋章";
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.listIds = [];
    this.alllistIds = [];
    this.badgeList = [];
    this.badgeList1 = [];
    this.selectedBadgeTab = 0;
    this.expertBadge = true;
    this.myBadge = false;
    this.getBadgesSummerisedListByPagination();
    this.filterUserBadge();
  }
  getAllBagdeList(){
    this.httpService.GetBadgesList(this.pageNo).subscribe(res =>{
        this.badgeList = res;
    });
  }
  
  getBadgesSummerisedListByPagination(){
    this.httpService.GetBadgesSummerisedListByPagination(this.pageNo,"1,2").subscribe(res =>{
      if(res.length < 1){
        this.lastPage = true;
        return;
      }
      let list = res.sort((a, b) => {a.id > b.id});
      for (let index = 0; index < list.length; index++) {
        if (list[index].recordStatus == "ACTIVE") {
          this.badgeList.push(list[index]); 
        }
      }
      this.httpService.GetBadgesSummerisedListByPagination(this.pageNo+1,"1,2").subscribe(resp =>{
        if(resp.length < 1){
          this.lastPage = true;
          return;
        }
        let list = resp.sort((a, b) => {a.id > b.id});
        for (let index = 0; index < list.length; index++) {
          if (list[index].recordStatus == "ACTIVE") {
            this.badgeList.push(list[index]); 
          }
        }
      },error =>{
        this.lastPage = true;
        });
    },error =>{
      this.lastPage = true;
    })
  }
  filterUserBadge(){
    this.httpService.GetAllBagdeListByUserId(true).subscribe(res =>{
      var list = [];
      // var list1 = [];
      if(res){
        // console.log(res);
        res.forEach((item, index) => {
          if(item.status == "COMPLETED"){
            list.push(item);
          }
        });
        // for (let index = 0; index < this.badgeList.length; index++) {
        //   for (let index_ = 0; index_ < list.length; index_++) {
        //     if(this.badgeList[index].id == list[index_].id){
        //       list1.push(this.badgeList[index]);
        //     }
        //   }
        // }
        // this.badgeList = [];
        this.badgeList1 = list;
        // console.log(list);
        
      }
      // console.log(list);
      
    },error =>{
      this.lastPage = true;
      console.log(error._body);
     });
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.productSlider.stopAutoplay();
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.styleLightContent();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
          this.settingsProvider.productSlider.startAutoplay();
          this.settingsProvider.slider.startAutoplay();
          this.settingsProvider.statusBar.styleLightContent();
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
      this.settingsProvider.statusBar.styleDefault();
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.styleLightContent();
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
  getAllBagdeListByUserId(){
    this.listIds = [];
    this.alllistIds = [];
    this.httpService.GetAllBagdeListByUserId(true).subscribe(res =>{
      if(res != '')
      {
        this.isUserBadge =true;
        this.badgeListByUser = res;
        this.listIds = [];
        this.alllistIds = [];
        this.badgeListByUser.forEach((item, index) => {
          if(item.status == "COMPLETED"){
            if(item.point >= 100){
              item.point = 100;
              this.listIds.push(item.badge.id);
            }
            this.alllistIds.push(item.badge.id);
          }
        });
      }else{
        this.alllistIds = [];
        this.listIds = [];
        this.isUserBadge =false;
      }
    },error =>{
      this.lastPage = true;
      console.log(error._body);
     });
  }

  /*Switching Between tabs*/
  selectedTab(index) {
    this.expertBadge =false;
    this.myBadge = false;
    this.slider.lockSwipes(false);
    this.slider.slideTo(index);
    this.slider.lockSwipes(true);
    this.selectedBadgeTab = index;
    if (index == 0) {
      this.expertBadge = true;
      this.content.scrollTo(0, this.panelPos1, 50);
    }
    if (index == 1) {
      this.myBadge = true;
      this.content.scrollTo(0, this.panelPos2, 50);
    }
  }

  /*Pagination Method when user Scroll page to bottom*/
  doInfinite(infiniteScroll) {
    if (this.lastPage == true) return;
    this.pageNo = this.pageNo + 1;
    setTimeout(() => {
      this.httpService.GetBadgesSummerisedListByPagination(this.pageNo,"1,2").subscribe(res =>{
        if(res.length < 1){
          this.lastPage = true;
          return;
        }
        this.badgeList.push(res);
        this.selectedTab(0);
      });
      infiniteScroll.complete();
    }, 500);
  }

  calculateWidth(badgeId:number,point): string {
    if(point >= 100){
      return "100%";
    }
    else{

      return point + "%";
    }
    // if(this.badgeListByUser != null)
    // {
    //   for (let badgeUser of this.badgeListByUser){
    //     if(badgeId == badgeUser.badge.id){
    //         this.currentScore = badgeUser.point;
    //         return badgeUser.point + "%";
    //     }else{
    //         this.currentScore = 0;
    //     }
    //   }
    // }else{
    //   this.currentScore = 0;
    //   return 0 + "%";
    // }
  }

  showBadge(badge: Badge) {
    this.navCtrl.push(BadgeDetailPage, {
      id: badge.id
    });
  }

  score(badgeId:number): number {
    if(this.badgeListByUser != null)
    {
      for (let badgeUser of this.badgeListByUser){
        if(badgeId == badgeUser.badge.id){
          return this.currentScore = badgeUser.point;
        }
      }
    }else{
      return this.currentScore = 0;
    }
  }
}
