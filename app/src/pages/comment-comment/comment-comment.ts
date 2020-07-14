import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform} from 'ionic-angular';
import { Util }  from "../../global/util";

@IonicPage()
@Component({
  selector: 'page-comment-comment',
  templateUrl: 'comment-comment.html',
})
export class CommentCommentPage {

  commentData;

  commentComments = [
    {
      id: 1,
      // writerId: 1,
      commentId: 1,
      writerImage: "assets/img/profile_image.jpg",
      writerName: "晴天娃娃",
      content: "胡说",
      likeCount: 5,
      created: new Date(2017, 5, 3)
    },
    {
      id: 2,
      // writerId: 1,
      commentId: 1,
      writerImage: "assets/img/profile_image_2.jpg",
      writerName: "TT",
      content: "nani?",
      likeCount: 2,
      created: new Date(2017, 5, 3)
    }
  ];

  constructor(public navCtrl: NavController,
              public platfrom:Platform,
              public navParams: NavParams) {
    this.commentData = navParams.data;
    console.log(this.commentData);
  }

  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platfrom,this.navCtrl)
  }

}
