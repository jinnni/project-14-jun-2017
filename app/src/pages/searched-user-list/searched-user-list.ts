import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform } from 'ionic-angular';
import { App } from 'ionic-angular/components/app/app';
import { HttpService } from '../../services/httpService';
import { GlobalVariable } from '../../global/global.variable';
import { SignInUpPage } from '../../pages/sign-in-up/sign-in-up';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage()
@Component({
  selector: 'page-searched-user-list',
  templateUrl: 'searched-user-list.html',
})
export class SearchedUserListPage {
  list:any;
  searchUserList:any;
  searchtext:string;
  imageUrl:string;
  userList: any =[];
  isGuestUser: boolean;
  userData:any;
  socialProfilePic:string;
  lastPage:boolean = false;
  pageNo = 0;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private settingsProvider:SettingsProvider,
    private alertCtrl: AlertController,
    public appCtrl: App,
    public platform: Platform,
    public dataService:HttpService) {
    // this.dataService.toggleLoader("ugc-loader",true);
    this.list = navParams.get("list");
    this.searchtext = navParams.get("title");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userList = [];
    if (!GlobalVariable.isAuthUser) {
      this.isGuestUser = false;
    } else {
      this.isGuestUser = true;
    }
  }
  doInfinite(infiniteScroll) {
    this.pageNo++;
    this.dataService.SearchUserObject(this.searchtext,this.pageNo).subscribe(res => {
      if (res.length < 1){this.lastPage = true;}
      for (let index = 0; index < res.length; index++) {
        this.userList.push(res[index]);
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
    this.userList = [];
    this.dataService.SearchUserObject(this.searchtext,this.pageNo + 1).subscribe(res => {
      if(res.length == 0){
        this.lastPage = true;
      }
    })
    this.dataService.SearchUserObject(this.searchtext,this.pageNo).subscribe(res => {
      this.searchUserList = res;
      console.log(this.searchUserList);
      
      for (let index = 0; index < this.searchUserList.length; index++) {
        this.userList.push(this.searchUserList[index]);
      }
      console.log(this.userList);
      
    },error =>{});
  }
  goToUserProfile(user:any){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }
}
