import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, Platform, ActionSheetController, ToastController } from 'ionic-angular';
import { HttpService } from '../../services/httpService';
import { GlobalVariable } from "../../global/global.variable";
import { SignInUpPage } from '../../pages/sign-in-up/sign-in-up';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { CommentPage } from '../../pages/comment/comment';
import { Clipboard } from '@ionic-native/clipboard';
import {Util} from "../../global/util";
import { Content, Slides } from 'ionic-angular';
import { FollowerReviewsPage } from '../../pages/follower-reviews/follower-reviews';
import { StatusBar } from '@ionic-native/status-bar';
import { SettingsProvider } from '../../providers/settingsProvider';
declare let WeiboSDK:any;
declare let Wechat:any;
@IonicPage()
@Component({
  selector: 'page-follower-ugc-review',
  templateUrl: 'follower-ugc-review.html',
})
export class FollowerUgcReviewPage {
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) _slides: Slides;
  @ViewChild('input') myInput;
  commentPage = CommentPage;
  util = Util;
  selectedSubUgcTab: number;
  commentsTotal:number;
  isOpen = false;
  productreviewArrlist = [];
  reportReasonsList:any = [];
  userData: any;
  imageUrl: any;
  socialProfilePic: any;
  isGuestUser: boolean;
  page1 = 0;
  ugc: boolean;
  review: boolean;
  totPg1:any;
  public pageSubTabs: any;
  FollowingUGCListData: any = [];
  lastPage1: boolean = false;
  isWriting:boolean = true;
  userAuth:boolean;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public statusBar: StatusBar,
    public appCtrl: App,
    private actionsheetCtrl: ActionSheetController,
    public platform:Platform,
    private clipboard: Clipboard,
    private settingsProvider:SettingsProvider,
    public UserService: HttpService) {
    this.UserService.toggleLoader("ugc-loader",true);
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.selectedSubUgcTab = 0;
    this.pageSubTabs = "tab0";
    this.userAuth = GlobalVariable.isAuthUser;
  }
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    this.getAllFollowingUserUGCReview();
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
  }
  getAllFollowingUserUGCReview(){
    this.UserService.GetFollowingContentUGC(this.userData.id, this.page1, 6).subscribe(resp => {
      let res = resp.content;
      if(res.length == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader","");
      }
      if(res.length > 0){
        this.totPg1 = resp.totalPages - 1;
      }else{
        this.totPg1 = resp.totalPages;
      }
      for (let index = 0; index < res.length; index++) {
        res[index].isopen = false;
        var content = res[index].content;
        res[index].contentLight = content.slice(0,140);
        res[index].createComment = {postComment:''}
          this.getUgcCommentsListById(res[index].id,res[index]);
          if(Number(res[index].likeCount)>99999) res[index].likeCount = this.getCountStyle(res[index].likeCount.toString());
          this.FollowingUGCListData.push(res[index]);
      }
      if(this.page1 == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-follower-ugc-review');
      }
    });
  }
  doInfinite1(infiniteScroll) {
    if (this.lastPage1 == true) return;
    setTimeout(() => {
      this.page1 = this.page1 + 1;
      this.UserService.GetFollowingContentUGC(this.userData.id, this.page1, 6).subscribe(resp => {
        let res = resp.content;
        if(res.length > 0){
          this.totPg1 = resp.totalPages - 1;
        }else{
          this.totPg1 = resp.totalPages;
        }
        for (let index = 0; index < res.length; index++) {
          res[index].isopen = false;
          var content = res[index].content;
          res[index].contentLight = content.slice(0,140);
          res[index].createComment = {postComment:''}
            this.getUgcCommentsListById(res[index].id,res[index]);
            if(Number(res[index].likeCount)>99999) res[index].likeCount = this.getCountStyle(res[index].likeCount.toString());
            this.FollowingUGCListData.push(res[index]);
        }
      });
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 500);
  }
  doInfiniteUGCClicking1(infiniteScroll) {
    if (this.lastPage1 == true) return;
      this.page1 = this.page1 + 1;
      this.UserService.GetFollowingContentUGC(this.userData.id, this.page1, 8).subscribe(resp => {
        let res = resp.content;
        if(res.length > 0){
          this.totPg1 = resp.totalPages - 1;
        }else{
          this.totPg1 = resp.totalPages;
        }
        for (let index = 0; index < res.length; index++) {
          res[index].isopen = false;
          var content = res[index].content;
          res[index].contentLight = content.slice(0,140);
          res[index].createComment = {postComment:''}
            this.getUgcCommentsListById(res[index].id,res[index]);
            if(Number(res[index].likeCount)>99999) res[index].likeCount = this.getCountStyle(res[index].likeCount.toString());
            this.FollowingUGCListData.push(res[index]);
        }
      });
  }

  getUgcCommentsListById(id:string,response){
    var resp = [];
    var charLimit = 45;
    if(response.hasOwnProperty("comments")){
      if(response.comments.length > 0){
        this.commentsTotal=response.comments.length;
        resp = response.comments;
        for(let i = 0; i < response.comments.length; i++){
          if(resp[i].comment.length > charLimit){
            resp[i].comment = resp[i].comment.slice(0, charLimit) + '...';
          }else{
            resp[i].comment = resp[i].comment;
          }
        }
        // if(id == this.ugcId){
        //   this.comments = resp
        // }else{
          response.commentList = resp;
        // }
      }  
  }
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
      this.UserService.addLike(item.id,"/ugc",true).subscribe(res =>{
        this.FollowingUGCListData[pos].liked = true;
        if(this.FollowingUGCListData[pos].likeCount<99999) this.FollowingUGCListData[pos].likeCount = this.FollowingUGCListData[pos].likeCount+1;
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
      this.UserService.removeLike(item.id,"/ugc",true).subscribe(res =>{
        this.FollowingUGCListData[pos].liked = false;
        if(this.FollowingUGCListData[pos].likeCount<=99999) this.FollowingUGCListData[pos].likeCount = this.FollowingUGCListData[pos].likeCount-1;
      });
    }
  }
  
  selectedSubTab(index) {
    this.selectedSubUgcTab = index;
    if (index == 0) {
      this.ugc = true;
      this.review = false;
    }
    if (index == 1) {
      this.ugc = false;
      this.review = true;
      this.navCtrl.push(FollowerReviewsPage).then(()=>{
        this.selectedSubUgcTab = 0;
        this.pageSubTabs = "tab0";
      });
    }
  }
  
   goToProfile(user: any) {
    if (user.id == localStorage.getItem("UserData.userId")) {
      this.navCtrl.parent.select(4);
    } else {
      this.navCtrl.push(ProfilePublicPage, { userData: user });
    }
  }
  toggleFollowUserugc(item:any) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.UserService.followUser(this.userData.id,item.user.id,"/users",true).subscribe(res =>{
        item.user.following = true;
      });
    }
  }

  toggleUnfollowUserugc(item:any) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.UserService.unfollowUser(this.userData.id,item.user.id,"/users",true).subscribe(res =>{
        item.user.following = false;
      });
    }
  }
  ionSlideNextStartChange(event,images){
    if(event._activeIndex != 0 && event._activeIndex < images.length){
      var ele = document.querySelectorAll('.'+event._elementRef.nativeElement.classList[0]+' img')[event._activeIndex - 1];
      ele.setAttribute("src",this.imageUrl+images[event._activeIndex]);
    }
  }
  onReadLessReadMore6(data){
    console.log(data);
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
    }
  }
  showMoreUgcComment1(item:any,ugcId: number, setBool){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(CommentPage,{item:item, id:ugcId, bool : setBool});
    }
  }
  showMoreUgcComment(item:any,ugcId: number, setBool){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(CommentPage,{item:item, id:ugcId, bool : setBool});
    }
  }
  toggleShare(detailData){
    let actionSheet = this.actionsheetCtrl.create({
      title: '分享至',
      cssClass: 'action-sheets-grid',
      buttons: [
        {
          cssClass:'btn-wechat',
          handler: () => {  
            Wechat.share({
              message: {
                title: detailData.title,
                description: detailData.content,
                thumb: this.imageUrl+detailData.imageArray[0],
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
                title: detailData.title,
                description: detailData.content,
                thumb: this.imageUrl+detailData.imageArray[0],
                media: {
                  type: Wechat.Type.LINK,
                  webpageUrl: "pjapp://pjdarenapp.com"
                }
              },
              scene: Wechat.Scene.MOMENT   // share to Timeline
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
          cssClass:'btn-weibo',
          handler: () => {
            let args :any = {};
            args.url = 'pjapp://pjdarenapp.com';
            args.title = detailData.title;
            args.description = detailData.content;
            args.image = this.imageUrl+detailData.imageArray[0];
            WeiboSDK.shareToWeibo(function () {
              this.alertCtrl.create({
                title: "",
                message: "帖子已分享到微博！",
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            }, function (failReason) {
              this.alertCtrl.create({
                title: "",
                message: failReason,
                cssClass: 'okcancel',
                buttons: ["确定"]
              }).present();
            }, args);
          }
        },
        {
          cssClass :detailData.favourite == true ? 'btn-collection' : 'btn-collection',
          handler: () => {
            if(detailData.favourite == false || typeof detailData.favourite == 'undefined'){
              if(!GlobalVariable.isAuthUser){
                this.alertCtrl.create({
                  title: "",
                  message: "你必须登录才能看到此页面",
                  cssClass: 'okcancel',
                  buttons: ["确定"]
              }).present();
                this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
              }else{
                this.UserService.addFavoriteUgc(detailData.id,"/ugc",true).subscribe(res =>{
                  detailData.favourite = 1;
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
                this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
              }else{
                this.UserService.removeFavoriteUgc(detailData.id,"/ugc",true).subscribe(res =>{
                  detailData.favourite = 0;
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
            this.presentReportPrompt(detailData);
          }
        },
        {
          cssClass: 'btn-cancel',
          role: 'cancel',
          text: "取消",
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      actionSheet.present();
    }
  }
  presentReportPrompt(detailData) {
    let alert_ = this.alertCtrl.create();
    /*Report UGC*/
    alert_.setTitle('我要举报！');
    for(let item of this.reportReasonsList){
      alert_.addInput({
        type: 'radio',
        label: item.reason+'',
        value: JSON.stringify(item)+''
      });
    }
    alert_.addButton('取消');
    alert_.addButton({
      text: '提交',
      handler: data => {
        if(data){
          let newData = JSON.parse(data);
          this.UserService.ReportUGC(newData.reason,newData.id,detailData.id).subscribe(res =>{
            this.alertCtrl.create({
              title: "",
              message: "谢谢您的反馈！",
              cssClass: 'okcancel',
              buttons: ["确定"]
          }).present();
          });
        }else{
          return false;
        }
      }
    });
    alert_.present();
  }
  ugcComment(ugcId: number){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      if(this.isWriting == true){
        this.isWriting = false;
      }else{
        this.isWriting = true;
        setTimeout(()=>{
          this.myInput.setFocus();
        },100);
      }
    }
  }
  shiftDown(byId){
    let ele = document.getElementById(byId);
    ele.style.height = (window.innerHeight/4)+'px';
    var parent = document.querySelector('page-follower-ugc-review .scroll-content');
    parent.classList.add("no-scroll");
  }

  looseFocus(byId){
    let ele = document.getElementById(byId);
    ele.style.height = 0+'px';
    var parent = document.querySelector('page-follower-ugc-review .scroll-content');
    parent.classList.remove("no-scroll");
  }
}
