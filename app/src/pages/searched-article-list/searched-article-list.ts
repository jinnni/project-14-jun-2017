import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, Platform } from 'ionic-angular';
import { HttpService } from '../../services/httpService';
import { GlobalVariable } from '../../global/global.variable';
import { SignInUpPage } from '../../pages/sign-in-up/sign-in-up';
import { UgcDetailPage } from '../../pages/ugc-detail/ugc-detail';
import { ArticleDetailPage } from '../../pages/article-detail/article-detail';
import { CommentPage } from '../../pages/comment/comment';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-searched-article-list',
  templateUrl: 'searched-article-list.html',
})
export class SearchedArticleListPage {
  list:any;
  searchArticleList:any;
  searchtext:string;
  imageUrl:string;
  userData:any = {};
  isGuestUser:boolean;
  userAuth:boolean;
  lastPage:boolean = false;
  pageNo = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,private alertCtrl: AlertController,
    private settingsProvider:SettingsProvider,
    public appCtrl: App,
    public platform: Platform,
    public dataService:HttpService) {
      this.dataService.toggleLoader("ugc-loader",true);
      this.list = navParams.get("list");
      this.searchtext = navParams.get("title");
      this.imageUrl = localStorage.getItem("myImageUrl");
      this.userData =JSON.parse(localStorage.getItem("UserData"));
      this.userAuth = GlobalVariable.isAuthUser;
      if(!GlobalVariable.isAuthUser){
        this.isGuestUser =false;
      }else{
        this.isGuestUser =true;
      }
  }
  doInfinite(infiniteScroll) {
    this.pageNo++;
    this.dataService.SearchArticleObject(this.searchtext,this.pageNo).subscribe(res => {
      if (res.length < 1){this.lastPage = true;};
      for(let ind = 0; ind<res.length; ind++){
        res[ind].createComment = {postComment:''};
        this.searchArticleList.push(res[ind]);
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
      this.searchArticleList = [];
      this.dataService.SearchArticleObject(this.searchtext,this.pageNo).subscribe(res => {
        for(let ind = 0; ind<res.length; ind++){
          res[ind].createComment = {postComment:''};
          this.searchArticleList.push(res[ind]);
        }
        console.log(this.searchArticleList);
        if(this.pageNo == 0){
          this.dataService.getAllImagesWithClassname("ugc-loader",'page-searched-article-list');
        }
      },error =>{
        if(this.pageNo == 0){
          this.dataService.getAllImagesWithClassname("ugc-loader",'page-searched-article-list');
        }
      });
    });
  }
  gotoNextArticle(name, id, status,item) {
    name === 'TIMELINE_ARTICLE' ? this.navCtrl.push(UgcDetailPage, {item: item,id: id,status: status}) : this.navCtrl.push(ArticleDetailPage, {item: item,id: id,status: status});
  }
  toggleFollowUser(item:any,pos:number) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.dataService.followUser(this.userData.id,item.user.id,"/users",true).subscribe(res =>{
        this.searchArticleList[pos].user.following = 1;
      });
    }
  }
  toggleUnfollowUser(item:any,pos:number) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.dataService.unfollowUser(this.userData.id,item.user.id,"/users",true).subscribe(res =>{
        this.searchArticleList[pos].user.following = 0;
      });
    }
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
  toggleLikeUp(item:any,pos:number) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.dataService.addLike(item.id,"/ugc",true).subscribe(res =>{
        this.searchArticleList[pos].liked = true;
        if(this.searchArticleList[pos].likeCount<99999)
          this.searchArticleList[pos].likeCount = this.searchArticleList[pos].likeCount + 1;
      });
    }
  }
  toggleLikeDown(item:any,pos:number){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.dataService.removeLike(item.id,"/ugc",true).subscribe(res =>{
        this.searchArticleList[pos].liked = 0;
        if(this.searchArticleList[pos].likeCount<100000)
          this.searchArticleList[pos].likeCount = this.searchArticleList[pos].likeCount-1;
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
      this.navCtrl.push(CommentPage,{item: item, id:item.id});
    }
  }
}
