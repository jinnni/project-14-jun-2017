import {Component,ViewChild, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Ugc} from "../../data/ugc.interface";
import {NavParams, NavController,Platform, ToastController, AlertController, ActionSheetController, App} from "ionic-angular";
import {CommentPage} from "../comment/comment";
import {Util} from "../../global/util";
import {HttpService} from "../../services/httpService";
import { Content, Slides } from 'ionic-angular';
import {GlobalVariable} from "../../global/global.variable";
import {SignInUpPage} from "../sign-in-up/sign-in-up";
import { Clipboard } from '@ionic-native/clipboard';
import { ENV } from '@app/env';
import { SettingsProvider } from '../../providers/settingsProvider';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { StatusBar } from '@ionic-native/status-bar';
declare let WeiboSDK:any;
declare let Wechat:any;
@Component({
  selector: 'page-ugc-detail',
  templateUrl: 'ugc-detail.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class UgcDetailPage {
  @ViewChild(Content) content: Content;
  @ViewChild(Slides) _slides: Slides;
  @ViewChild('input') myInput;
  commentPage = CommentPage;
  util = Util;
  status:any;
  type = "ugc";
  selectedItem:any;
  ugcId:any;
  publicUserId:any;
  detailData:any;
  ugcData: Ugc;
  restListDataOdd:any = [];
  restListDataEven:any = [];
  restListData:any = [];
  reportReasonsList:any = [];
  comments:any = [];
  userData:any;
  userAuth:boolean;
  isScroll:boolean;
  showBackBtn:boolean;
  commentsTotal:number;
  imageUrl:string;
  socialProfilePic:string;
  isGuestUser:boolean;
  idUserInfo:any={};
  slidesHeight: any;
  slidesMoving: boolean = true;
  sliderHeight;
  sliderWidth;
  sliderHeight1 = [];
  sliderWidth1 = [];
  element:any={};
  elementfooter:any={};
  createComment:any;
  prohibitedWords:any = [];
  isWriting:boolean = true;
  page:number = 0;
  isLastPage:boolean;
  hasButton:boolean = false;
  winHeight;
  maxHeight;
  minHeight;
  restListData1 :any;
  totPg;
  constructor(public navParams: NavParams,
              public UserService:HttpService,
              private toastCtrl: ToastController,
              private navCtrl:NavController,public appCtrl: App,
              public platform:Platform,
              public statusBar: StatusBar,
              private alertCtrl: AlertController,
              private actionsheetCtrl: ActionSheetController,
              private changeDetectorRef: ChangeDetectorRef,
              private clipboard: Clipboard,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.UserService.toggleLoader("ugc-loader",true);
    this.status = navParams.get("status");
    this.ugcId = navParams.get("id");
    this.publicUserId = navParams.get("userId");
    this.selectedItem = navParams.get("item");
    this.selectedItem.hasButton = false;
    this.selectedItem.createComment = {postComment:''};
    this.selectedItem.height = 'auto';
    this.selectedItem.isopen = false;
    if (this.selectedItem.content == undefined) {
      this.selectedItem.content = this.selectedItem.contentLight;
    }
    this.selectedItem.contentLight = this.selectedItem.content.slice(0,140);
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    this.detailData =[];
    this.detailData = this.selectedItem;
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
  }
  ionViewDidEnter(){
    this.datacall(this.selectedItem, this.ugcId,"enter");
    
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
          this.settingsProvider.slider.startAutoplay();
          this.settingsProvider.slider.loop = true;
          this.settingsProvider.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
        }
      }
      this.settingsProvider.productSlider.startAutoplay();
    }
  }
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    
    this.changeDetectorRef.detectChanges();
    this.winHeight =  window.innerHeight;
    this.maxHeight = this.winHeight - (this.winHeight/2.5);
    this.minHeight = this.winHeight - (this.winHeight/1.5)
  }
  ngAfterViewInit() {
    this.slidesMoving = true;
    this.idUserInfo = document.getElementById('idUserInfo');
    this.elementfooter = document.getElementById('footer_box');
  }

  GetProhibitedWordsList(){
    this.UserService.getProhibitedWordsList().subscribe(res=>{
      this.prohibitedWords = res;
    });
  }

  scrollHandler(event){
    if(event.scrollTop == 0){
      this.showBackBtn = false;
    }
    if(event.scrollTop > 80){
      this.showBackBtn = true;
    }else{
      this.showBackBtn = false;
    }
    this.changeDetectorRef.detectChanges();
  }

  backClick(){
    this.navCtrl.pop();
  }

  shiftDown(byId){
    let ele = document.getElementById(byId);
    ele.style.height = (this.winHeight/4)+'px';
    var parent = document.querySelector('page-ugc-detail .scroll-content');
    parent.classList.add("no-scroll");
    this.changeDetectorRef.detectChanges();
  }

  looseFocus(byId){
    let ele = document.getElementById(byId);
    var parent = document.querySelector('page-ugc-detail .scroll-content');
    setTimeout(() => {
      ele.style.height = 0+'px';
      parent.classList.remove("no-scroll");
    }, 500);
  }

  onSelectToggle(element){
    this.onSelect(element.currentTarget.previousElementSibling,1);
  }
  onSelect(element,type){
    let getH;
    let isActive;
    let ele;
    if(type == 1){ele = element;}
    else{ele = element.currentTarget;}
    getH = ele.getAttribute("height");
    if(ele.getAttribute("attr") == 'false'){
      ele.setAttribute("attr",'true');
    }else if(ele.getAttribute("attr") == 'true'){
      ele.setAttribute("attr",'false');
    }
    isActive = ele.getAttribute("attr");
    if(isActive == 'false'){
      ele.setAttribute("style",'height:'+ getH +'px');
      ele.nextElementSibling.innerHTML = '..展开';
    }else if(isActive == 'true'){
      ele.setAttribute("style",'height:auto');
      ele.nextElementSibling.innerHTML = '..收起';
    }
  }
  onReadLessReadMore(data){
    console.log(data);
    if(data.isopen == false){
      data.isopen = true;
    }else{
      data.isopen = false;
    }
  }
  
  ionViewCanEnter() {
    Util.unRegisterBackButton(this.platform,this.navCtrl);
    // this.datacall(this.selectedItem, this.ugcId,"enter");
  }
  doInfinite(infiniteScroll) {
    this.page = this.page + 1;
    setTimeout(() => {
    var ugcPromise = this.UserService.GetAutoUGCRelatedByTag(this.ugcId,this.page);
    ugcPromise.subscribe(res =>{
        if(res.last == true){
          this.isLastPage = true;
        }
        for (let i = 0; i < res.content.length; i++) {
          res.content[i].isopen = false;
          res.content[i].hasButton = false;
          res.content[i].createComment = {postComment:''}
          this.getUgcCommentsListById(res.content[i].id,res.content[i]);
          if(res.content[i].user.recordStatus == "ACTIVE") {
            if(Number(res.content[i].likeCount)>99999) res.content[i].likeCount = this.getCountStyle(res.content[i].likeCount.toString());
            if(this.publicUserId != undefined){
              console.log(this.publicUserId );
              if(this.publicUserId == res.content[i].user.id){
                this.restListData.push(res.content[i]);
              }
            }else{
              this.restListData.push(res.content[i]);
            }
          }
        }
      });
      if(infiniteScroll!=''){
        infiniteScroll.complete();
      }
    }, 1000);
  }
  datacall(selectedItem,id,type){
    this.restListData = [];
    new Promise((resolve, reject) => {
      resolve();
    }).then(()=>{
      var ugcPromise = this.UserService.GetUGCId(this.ugcId);
      ugcPromise.subscribe(res =>{
        this.selectedItem = res;
        this.selectedItem.hasButton = false;
        this.selectedItem.createComment = {postComment:''};
        this.selectedItem.height = 'auto';
        this.selectedItem.isopen = false;
        this.selectedItem.contentLight = this.selectedItem.content.slice(0,140);
        this.detailData = this.selectedItem;
        if(this.detailData.likeCount>99999) this.detailData.likeCount = this.getCountStyle(this.detailData.likeCount.toString());
        if(this.detailData.commentCount>99999) this.detailData.commentCount = this.getCountStyle(this.detailData.commentCount.toString());
        this.getUgcCommentsListById(id,this.detailData);
        this.detailData.commentCount = res.commentCount;
      });
    }).then(sourceType => {
      this.getUGCReportReasons();
    }).then(sourceType => {
      var ugcPromise = this.UserService.GetAutoUGCRelatedByTag(this.ugcId,this.page);
      ugcPromise.subscribe(res =>{
        this.totPg = res.totalPages - 1;
        for (let i = 0; i < res.content.length; i++) {
          res.content[i].isopen = false;
          res.content[i].hasButton = false;
          res.content[i].createComment = {postComment:''};
          this.getUgcCommentsListById(res.content[i].id,res.content[i]);
          if(res.content[i].user.recordStatus == "ACTIVE") {
            if(Number(res.content[i].likeCount)>99999) res.content[i].likeCount = this.getCountStyle(res.content[i].likeCount.toString());
            if(this.publicUserId != undefined){
              console.log(this.publicUserId );
              if(this.publicUserId == res.content[i].user.id){
                this.restListData.push(res.content[i]);
              }
            }else{
              this.restListData.push(res.content[i]);
            }
          }
        }
        if(this.page == 0){
          this.UserService.getAllImagesWithClassname("ugc-loader",'page-ugc-detail');
        }
      },error =>{
        if(this.page == 0){
          this.UserService.getAllImagesWithClassname("ugc-loader",'page-ugc-detail');
        }
      });
    }).catch((error) => {
      console.log(error);
      
    });
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
        this.restListData[pos].liked = true;
        if(this.restListData[pos].likeCount<99999) this.restListData[pos].likeCount = this.restListData[pos].likeCount+1;
      });
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
        this.restListData[pos].liked = false;
        if(this.restListData[pos].likeCount<=99999) this.restListData[pos].likeCount = this.restListData[pos].likeCount-1;
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
        item.user.following = true;
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
        item.user.following = false;
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
            this.clipboard.copy(ENV.webpageUrl + res.path);
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
    })
  }

  goToUserProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      if(this.publicUserId == this.userData.id){
        this.navCtrl.pop();
      }else{
        this.navCtrl.push(ProfilePublicPage, {userData: user});
      }
    }
  }

  getUgcCommentsListById(id:string,response){
    // this.comments = [];
    var resp = [];
    var charLimit = 45;
    console.log(response);
    
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
        if(id == this.ugcId){
          this.comments = resp
        }else{
          response.commentList = resp;
        }
      }  
  }
}

  getUgcCommentsListByIdOnSend(id:string,response){
    var resp = [];
    var charLimit = 45;
    this.UserService.GetUgcCommentsByIdPageNo(id,0).subscribe(res =>{
      if(res.length > 0){
        this.commentsTotal=res.length;
        if(res.length>4){
          for (let index = 0; index < 4; index++) {
            resp.push(res[index]);
          }
        }else{
          resp = res;
        }
        for(let i = 0; i < resp.length; i++){
          if(resp[i].comment.length > charLimit){
            resp[i].comment = resp[i].comment.slice(0, charLimit) + '...';
          }else{
            resp[i].comment = resp[i].comment;
          }
        }
        if(id == this.ugcId){
          this.comments = resp
        }else{
          response.commentList = resp;
        }
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
    /*Report UGC*/
    alert.setTitle('我要举报！');
    for(let item of this.reportReasonsList){
      alert.addInput({
        type: 'radio',
        label: item.reason+'',
        value: JSON.stringify(item)+''
      });
    }
    alert.addButton('取消');
    alert.addButton({
      text: '提交',
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
      message: "谢谢您的反馈！",
      cssClass: 'okcancel',
      buttons: ["确定"]
  }).present();
  }

  submitComments(id,response) {
    if(this.settingsProvider.userStatus.ugcComments){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    if (response.createComment.postComment == null ) {
      Util.showSimpleToastOnTop("你也来评论吧！", this.toastCtrl);
      return;
    }
    let flag = 0;
    for(let word of this.prohibitedWords){
      if (response.createComment.postComment.search(word) != -1 ) {
        let alert = this.alertCtrl.create({
          title: '警告！',
          message: '此评价包含禁用词，请勿使用任何禁用词',
          buttons: [
            {
              text: 'Okay',
              role:'cancel'
            }
          ]
        });
        alert.present();
        flag = 1;
      }
    }
    if(flag == 0){
      response.hasButton = false;
      this.UserService.addUGCComment(response.createComment.postComment,id)
        .subscribe(res =>{
          if(response.commentCount<99999) response.commentCount = response.commentCount + 1;
          response.createComment = {postComment:''};
          this.getUgcCommentsListByIdOnSend(id,response);
        },err=>{
          response.createComment = {postComment:''};
        });
    }
  }
  ionSlideNextStartChange(event,images){
    if(event._activeIndex != 0 && event._activeIndex < images.length){
      var ele = document.querySelectorAll('.'+event._elementRef.nativeElement.classList[0]+' img')[event._activeIndex - 1];
      ele.setAttribute("src",this.imageUrl+images[event._activeIndex]);
    }
  }
}
