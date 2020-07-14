import { Component } from '@angular/core';

@Component({
  selector: 'write-comment-footer',
  templateUrl: 'write-comment-footer.html'
})
export class WriteCommentFooterComponent {
  createComment:any;
  ugcId:any;
  constructor() {
    this.createComment ={
      'postComment':''
    }
  }
  submitComment() {
    console.log("From footer");
    /*if (this.createComment.postComment == null ) {
      Util.showSimpleToastOnTop("Please Add Comment !", this.toastCtrl);
      return;
    }
    this.httpSevice.addUGCComment(this.createComment.postComment,this.ugcId)
      .subscribe(res =>{
        console.log(res);
        this.navCtrl.remove(this.viewCtrl.index);
      });*/
  }
}
