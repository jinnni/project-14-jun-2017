import {Component, Input} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import {CommentCommentPage} from "../../pages/comment-comment/comment-comment";
import {Util} from "../../global/util";
import {HttpService} from "../../services/httpService";
import {MoreContentPage} from "../../pages/more-content/more-content";
import {GlobalVariable} from "../../global/global.variable";
import {CommentPage} from "../../pages/comment/comment";
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
@Component({
  selector: 'comment-item',
  templateUrl: 'comment-item.html'
})
export class CommentItemComponent {

  commentCommentPage = CommentCommentPage;
  util = Util;

  @Input()
  comment;

  @Input()
  showLike: boolean;

  @Input()
  showComment: boolean;
  userData:string;
  imageUrl:string;
  socialProfilePic:string;
  isGuestUser:boolean;
  isShowFooter : boolean;
  constructor(private httpService:HttpService,
              private alertCtrl: AlertController,
              private navCtrl:NavController) {

                this.imageUrl = localStorage.getItem("myImageUrl");
                this.socialProfilePic = localStorage.getItem("socialProfilePic");
                this.userData =JSON.parse(localStorage.getItem("UserData"));
                if(GlobalVariable.isAuthUser){
                   this.isGuestUser = true;
                }else{
                   this.isGuestUser = false;
                }
  }
  toggleLikeUp(comment: any){
    this.httpService.addLike(comment.id,"/ugc-comment",true).subscribe(res =>{
      this.comment.liked = true;
      this.comment.likeCount += 1;
    });
  }
  toggleLikeDown(comment: any){
    this.httpService.removeLike(comment.id,"/ugc-comment",true).subscribe(res =>{
      this.comment.liked = false;
      this.comment.likeCount -= 1;
    });
  }
  goToUserProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }
  showMoreContent(item:any){
    if(GlobalVariable.isAuthUser){
      this.navCtrl.push(MoreContentPage,{data:item,title:"Comment"});
    }else{
      this.alertCtrl.create({
        title: "",
        message: "登录后才能看到更多内容哦！",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
    }
  }
  ShowWriteComment(item:any,showFooter:any){
      this.navCtrl.push(CommentPage,{id:item.ugc.id});
  }
}
