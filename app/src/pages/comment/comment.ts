import {Component,ViewChild} from '@angular/core';
import {IonicPage, AlertController, NavController, Platform, NavParams,ToastController,Content} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {Comments} from "../../data/commentList.inteface";
import {Util} from "../../global/util";
import {GlobalVariable} from "../../global/global.variable";
import { SettingsProvider } from '../../providers/settingsProvider';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
@IonicPage()
@Component({
  selector: 'page-comment',
  templateUrl: 'comment.html',
})
export class CommentPage {
  @ViewChild(Content) content: Content;
  @ViewChild('input') myInput;
  title: string;
  comments: Comments[];
  reverseComments: any = [];
  ugcId:any;
  util = Util;
  userData:any;
  imageUrl:string;
  socialProfilePic:string;
  createComment:any;
  isGuestUser:boolean;
  isWriting:boolean = true;
  pageNo:number = 0;
  lastPage:boolean;
  prohibitedWords:any = [];
  item:any;
  publicUserId:any;
  hasFocus=false;
  constructor(public navParams: NavParams,
              private alertCtrl: AlertController,
              public navCtrl: NavController,
              public platform: Platform,
              public  httpService:HttpService,
              private toastCtrl:ToastController,
              private settingsProvider:SettingsProvider) {
    this.publicUserId = navParams.get("userId");
    this.settingsProvider.isMenuOpened = false;
    this.ugcId = navParams.get("id");
    this.item = navParams.get("item");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.createComment = {postComment:''};
    this.hasFocus=false;
    if(GlobalVariable.isAuthUser){
      this.isGuestUser = true; 
    }else{
      this.isGuestUser = false;
    }
    this.GetProhibitedWordsList();
  }
  GetProhibitedWordsList(){
    this.httpService.getProhibitedWordsList().subscribe(res=>{
      this.prohibitedWords = res;
    });
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
    Util.unRegisterBackButton(this.platform,this.navCtrl);
  }
  ionViewDidEnter(){
    this.comments = [];
    this.getUgcCommentsListById();
    //this.ShowWriteComment();
  }
  getUgcCommentsListById(){
    this.httpService.GetUgcCommentsByIdPageNo(this.ugcId,this.pageNo).subscribe(res =>{
      // this.comments = res ;
      if(res.length < 1 || res.length < 8){
        this.lastPage = true;
      }
      if(res.length > 0){
        for(let i = 0, j= res.length; i<res.length; i++,j--){
          this.reverseComments[i] = res[j-1];
          this.comments.push(res[i])
        }
        if(this.pageNo == 0){
          this.pageNo++;
          this.getUgcCommentsListById();
        }
      }
      //if(this.navParams.get("bool") == true ){
        //this.ShowWriteComment();
      //}
    });
  }

  toggleLikeUp(comment: any){
    this.httpService.addLike(comment.id,"/ugc-comment",true).subscribe(res =>{
      comment.liked = true;
      comment.likeCount += 1;
    });
  }
  toggleLikeDown(comment: any){
    this.httpService.removeLike(comment.id,"/ugc-comment",true).subscribe(res =>{
     	comment.liked = false;
     	comment.likeCount -= 1;
    });
  }

  doInfinite_(infiniteScroll) {
    console.log(this.pageNo );
    this.pageNo = this.pageNo + 1;
    this.httpService.GetUgcCommentsByIdPageNo(this.ugcId,this.pageNo).subscribe(res =>{
      // this.comments = res ;
      if(res.length < 1){
        this.lastPage = true;
      }
      else if(res.length > 0){
        for(let i = 0, j= res.length; i<res.length; i++,j--){
          this.reverseComments[i] = res[j-1];
          this.comments.push(res[i])
        }
      }
      //if(this.navParams.get("bool") == true ){
        //this.ShowWriteComment();
      //}
    });
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }

  submitComment(item) {
    if(this.settingsProvider.userStatus.ugcComments){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    if(this.settingsProvider.userStatus.articleComments){
      Util.showSimpleToastOnTop("你没有权限！", this.toastCtrl);
      return;
    }
    this.pageNo = 0;
    this.settingsProvider.setCurrentPage("comment");
    if (item.createComment.postComment == null ) {
      Util.showSimpleToastOnTop("你也来评论吧！", this.toastCtrl);
      return;
    }
    let flag = 0;
    for(let word of this.prohibitedWords){
      if (item.createComment.postComment.search(word) != -1 ) {
        let alert = this.alertCtrl.create({
        title: '警告！',
        message: '此评价包含禁用词，请勿使用任何禁用词。',
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
      this.httpService.addUGCComment(item.createComment.postComment,this.ugcId)
        .subscribe(res =>{
          this.getUgcCommentsListById();
          item.createComment = {postComment:''};
        });
    }
    this.navCtrl.pop();
  }
  goToUserProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      if(this.publicUserId == this.userData.id){
        this.navCtrl.pop();
      }
      else if(this.publicUserId != this.userData.id && this.publicUserId != undefined){
        this.navCtrl.pop();
        this.navCtrl.pop();
        this.navCtrl.push(ProfilePublicPage, {userData: user});
      }else{
        this.navCtrl.push(ProfilePublicPage, {userData: user});
      }
    }
  }
  ShowWriteComment(){
    this.isWriting = true;
    setTimeout(()=>{
      this.myInput.setFocus();
    },500);
  }
}
