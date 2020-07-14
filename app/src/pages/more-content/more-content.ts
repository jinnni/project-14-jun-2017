import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import {Util} from "../../global/util";
import {HttpService} from "../../services/httpService";
import {GlobalVariable} from "../../global/global.variable";
/**
 * Generated class for the MoreContentPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-more-content',
  templateUrl: 'more-content.html',
})
export class MoreContentPage {

  util = Util;
  data : any;
  title: string;
  isComment: boolean;
  isReview: boolean;
  imageUrl:string;
  userData:string;
  socialProfilePic:string;
  isGuestUser:boolean;
  constructor(public navCtrl: NavController, public platform: Platform, public navParams: NavParams,private httpService:HttpService) {
    this.data =  navParams.get("data");
    this.title =  navParams.get("title");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.socialProfilePic = localStorage.getItem("socialProfilePic");
    this.userData =JSON.parse(localStorage.getItem("UserData"));
    if(this.title == "评论")
      this.isComment = true;
    else{
      this.isReview = true;
    }

    if(GlobalVariable.isAuthUser){
      this.isGuestUser = true;
    }else{
      this.isGuestUser = false;
    }



  }

  ionViewDidLoad() {
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
  toggleLikeUp(comment: any){
    this.httpService.addLike(comment.id,"/ugc-comment",true).subscribe(res =>{
      this.data.liked = true;
      this.data.likeCount += 1;
    });
  }
  toggleLikeDown(comment: any){
    this.httpService.removeLike(comment.id,"/ugc-comment",true).subscribe(res =>{
      this.data.liked = false;
      this.data.likeCount -= 1;
    });
  }
}
