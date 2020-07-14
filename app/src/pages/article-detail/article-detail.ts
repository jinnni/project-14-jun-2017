import {Component,ViewChild} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {Ugc} from "../../data/ugc.interface";
import {IonicPage, NavParams, NavController,Platform, ToastController, AlertController, ActionSheetController, App} from "ionic-angular";
import {CommentPage} from "../comment/comment";
import {Util} from "../../global/util";
import {HttpService} from "../../services/httpService";
import { Content } from 'ionic-angular';
import {GlobalVariable} from "../../global/global.variable";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import { Clipboard } from '@ionic-native/clipboard';
import { SettingsProvider } from '../../providers/settingsProvider';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';

declare let WeiboSDK:any;
declare let Wechat:any;
declare let $:any;

@IonicPage({
  segment: "ugc/:id"
})
@Component({
  selector: 'article-ugc-detail',
  templateUrl: 'article-detail.html'
})

export class ArticleDetailPage {
  @ViewChild(Content) content: Content;
  @ViewChild('input') myInput;
  commentPage = CommentPage;
  util = Util;
  status:any;
  type = "ugc";
  ugcId:any;
  detailData:any;
  ugcData: Ugc;
  restListDataOdd:any = [];
  restListDataEven:any = [];
  reportReasonsList:any = [];
  comments:any = [];
  userData:any;
  userAuth:boolean;
  isScroll:boolean;
  commentsTotal:number;
  imageUrl:string;
  socialProfilePic:string;
  isGuestUser:boolean;
  element:any={};
  elementfooter:any={};
  createComment:any;
  prohibitedWords:any = [];
  isWriting:boolean = true;
  page:number = 0;
  isLastPage:boolean;
  totPg;
  constructor(public navParams: NavParams,
              public UserService:HttpService,
              private toastCtrl: ToastController,
              private navCtrl:NavController,
              private appCtrl: App,
              public platform:Platform,
              private alertCtrl: AlertController,
              private actionsheetCtrl: ActionSheetController,
              private clipboard: Clipboard,
              private sanitizer:DomSanitizer,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.UserService.toggleLoader("ugc-loader",true);
    this.status = navParams.get("status");
    this.ugcId = navParams.get("id");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    this.detailData =[];
    this.detailData.createComment = {postComment:''};
    this.detailData = navParams.get("item");
    this.detailData.createComment = {postComment:''};
    this.comments =[];
    this.userAuth = GlobalVariable.isAuthUser;
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    if(GlobalVariable.isAuthUser){
      this.isGuestUser = true;
    }else{
      this.isGuestUser = false;
    }
    this.GetProhibitedWordsList();
    this.createComment ={
      postComment:''
    }
  }

  GetProhibitedWordsList(){
    this.UserService.getProhibitedWordsList().subscribe(res=>{
      this.prohibitedWords = res;
    });
  }

  doInfinite(infiniteScroll) {
    this.page = this.page+1;
    setTimeout(() => {
      this.UserService.GetTimelineListPageInfoSize(true,this.page,6).subscribe(resp =>{
        let res = resp.content;
        this.totPg = resp.totalPages - 1;
        if(res.length < 1){
          this.isLastPage = true;
          return;
        }
        for(let i=0; i<res.length; i++) {
          res[i].createComment = {postComment:''};
          if(i % 2 == 0){
            this.restListDataEven.push(res[i]);
          }else{
            this.restListDataOdd.push(res[i]);
          }
        }
      });
      infiniteScroll.complete();
    }, 1500);
  }

  scrollTop(){
    this.content.scrollToTop(1200);
    this.isScroll = false;
  }

  ionViewCanEnter() {
    Util.unRegisterBackButton(this.platform,this.navCtrl);
    this.datacall(this.ugcId,"enter",this.detailData);
  }
  showArticle(id,status,item){
    this.navCtrl.pop();
    this.navCtrl.push(ArticleDetailPage, {item: item,id: id,status: status})
  }
  datacall(id,type,item){
    new Promise((resolve, reject) => {
      resolve();
    }).then(sourceType => {
      this.UserService.GetUGCById(id).subscribe(res=>{
        res.createComment = {postComment:''};
        this.detailData = res;
        if(this.detailData.likeCount>99999) this.detailData.likeCount = this.getCountStyle(this.detailData.likeCount.toString());
        if(this.detailData.commentCount>99999) this.detailData.commentCount = this.getCountStyle(this.detailData.commentCount.toString());
        var pushHtml = document.querySelector(".card-subtitle");
        pushHtml.innerHTML = this.detailData.content;
        this.UserService.getAllImagesWithClassname("ugc-loader",'article-ugc-detail');
      },error =>{
        this.UserService.getAllImagesWithClassname("ugc-loader",'article-ugc-detail');
      });
    }).then(sourceType => {
      this.getUgcCommentsListById(id,item);
    }).then(sourceType => {
      this.getUGCReportReasons();
    }).then(sourceType => {
      this.UserService.GetTimelineListPageInfoSize(true,this.page,6).subscribe(resp =>{
        let res = resp.content;
        if(res.length < 1){
          this.isLastPage = true;
          return;
        }
        for (let i = 0; i < res.length; i++) {
          res[i].createComment = {postComment:''};
          if(res[i].featured == this.status){
            if(i % 2 == 0){
              this.restListDataEven.push(res[i]);
            }else{
              this.restListDataOdd.push(res[i]);
            }
          }else if(this.status == "none"){
            if(i % 2 == 0){
              this.restListDataEven.push(res[i]);
            }else{
              this.restListDataOdd.push(res[i]);
            }
          }
        }
      });
    }).catch((error) => {
      console.log(error);
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

  /*Like UGC Data*/
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
        if(type == "restListDataOdd"){
          this.restListDataOdd[pos].liked = true;
          this.restListDataOdd[pos].likeCount = this.restListDataOdd[pos].likeCount+1;
        }else{
          this.restListDataEven[pos].liked = true;
          this.restListDataEven[pos].likeCount = this.restListDataEven[pos].likeCount+1;
        }
      });
    }
  }

  /*Dislike UGC Data*/
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
        if(type == "restListDataOdd"){
          this.restListDataOdd[pos].liked = false;
          this.restListDataOdd[pos].likeCount = this.restListDataOdd[pos].likeCount-1;
        }else{
          this.restListDataEven[pos].liked = false;
          this.restListDataEven[pos].likeCount = this.restListDataEven[pos].likeCount-1;
        }
      });
    }

  }

  /*Follow User from UGC List*/
  toggleFollowUser(item:any) {
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
        this.detailData.user.following = true;
      });
    }

  }
  /*Unfollow User from UGC List*/
  toggleUnfollowUser(item:any) {
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
        this.detailData.user.following = false;
      });
    }
  }

  /*Like From Header*/
  toggleLikeUpHeader(item:any) {
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
        item.liked = 1;
        if(item.likeCount<99999) item.likeCount = item.likeCount+1;
      });
    }
  }

  /*Dislike From Header*/
  toggleLikeDownHeader(item:any){
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
        item.liked = 0;
        if(item.likeCount<=99999) item.likeCount = item.likeCount-1;
      });
    }
  }

  /*Add Favorite UGC*/
  toggleAddFavorite(item:any){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.UserService.addFavoriteUgc(item.id,"/ugc",true).subscribe(res =>{
        item.favourite = 1;
      });
    }
  }
  /*Remove Favorite UGC*/
  toggleRemoveFavorite(item:any){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.UserService.removeFavoriteUgc(item.id,"/ugc",true).subscribe(res =>{
        item.favourite = 0;
      });
    }
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
      this.isWriting = true;
      setTimeout(()=>{
        this.myInput.setFocus();
      },100);
    }
  }

  showMoreUgcComment(item: any, ugcId: number){
      if(!GlobalVariable.isAuthUser){
        this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
        this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
      }else{
        this.navCtrl.push(CommentPage,{item:item, id:ugcId});
      }
  }

  toggleShare(detailData){
    this.UserService.shareContentAPI(detailData.id,'/ugc/').subscribe(res => {
      let actionSheet = this.actionsheetCtrl.create({
        title: '分享至',
        cssClass: 'action-sheets-grid',
        buttons: [
        {
          cssClass:'btn-wechat',
          handler: () => { 
            Util.wechatShare(detailData,res,this.imageUrl,'session');
          }
        },
        {
          cssClass:'btn-moment',
          handler: () => {
            Util.wechatShare(detailData,res,this.imageUrl,'timeline');
          }
        },
        {
          cssClass:'btn-weibo',
          handler: () => {
            Util.wechatShare(detailData,res,this.imageUrl,'weibo');
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
            this.clipboard.copy("http://show.pjdaren.com/"+ res.path);
            Util.showSimpleToastOnTop("数据已复制成功", this.toastCtrl);
          }
        },
        {
          cssClass:'btn-report-ugc',
          handler: () => {
            this.presentReportPrompt();
          }
        },
        /*{
          text: 'QQ',
          cssClass:'btn-qq',
          handler: () => {
            this.clipboard.copy('Linked Copied from the PJ APP');
          }
        },*/
        {
          cssClass: 'btn-cancel',
          role: 'cancel',
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
    })
  }

  goToUserProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }

  getUgcCommentsListById(id:string,response){
    var resp = [];
    var charLimit = 45;
    this.UserService.GetUgcCommentsByIdPageNo(id,0).subscribe(res =>{
      if(res.length > 0){
        this.commentsTotal=res.length;
        for(let i = (res.length-1), j=0; i >=0; i--, j++){
          resp[j] = res[i];
        }
        if(resp.length > 5){
          resp = resp.splice(resp.length - 5);
        }
        resp = resp.reverse();
        for(let i = 0; i < resp.length; i++){
          if(resp[i].comment.length > charLimit){
            resp[i].comment = resp[i].comment.slice(0, charLimit) + '...';
          }else{
            resp[i].comment = resp[i].comment;
          }
        }
        this.comments = resp
      }else{
        response.commentList = [];
      }
    });
  }

  getUGCReportReasons(){
    this.UserService.GetUGCReportReasons().subscribe(res =>{
      this.reportReasonsList=res;
    });
  }

  presentReportPrompt() {
    let alert = this.alertCtrl.create();
    /*Report Article*/
    alert.setTitle('我要举报该帖子！');
    for(let item of this.reportReasonsList){
      alert.addInput({
        type: 'radio',
        label: item.reason+'',
        value: JSON.stringify(item)+''
      });
    }
    alert.addButton('取消');
    alert.addButton({
      text: '确定',
      handler: data => {
        if(data){
          let newData = JSON.parse(data);
          this.UserService.ReportUGC(newData.reason,newData.id,this.detailData.id).subscribe(res =>{
            this.showSuccessMessage();
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
      message: "你必须登录才能看到此页面",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
  }

  submitComment() {
    if(this.settingsProvider.userStatus.articleComments){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    if (this.detailData.createComment.postComment == null ) {
      Util.showSimpleToastOnTop("你也来评论吧！", this.toastCtrl);
      return;
    }

    let flag = 0;
    for(let word of this.prohibitedWords){
      if (this.detailData.createComment.postComment.search(word) != -1 ) {
        let alert = this.alertCtrl.create({
        title: '警告！',
        message: '此评价包含禁用词，请勿使用任何禁用词。',
        cssClass: 'okcancel',
        buttons: [
            {
              text: '确定',
              role:'cancel'
            }
          ]
        });
        alert.present();
        flag = 1;
      }
    }
    if(flag == 0){
      this.UserService.addUGCComment(this.detailData.createComment.postComment,this.detailData.id)
        .subscribe(res =>{
          if(this.detailData.commentCount<99999) this.detailData.commentCount = this.detailData.commentCount+1;
          // this.isWriting=false;
          this.detailData.createComment ={
            postComment:''
          }
          this.getUgcCommentsListById(this.ugcId,this.detailData);
        });
    }
  }

}
