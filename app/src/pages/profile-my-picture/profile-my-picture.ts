import {Component} from '@angular/core';
import {IonicPage, NavParams, NavController, Platform} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import { Util } from "../../global/util";

@IonicPage({
  segment: "profile/public/image/:userId"
})
@Component({
  selector: 'page-profile-my-picture',
  templateUrl: 'profile-my-picture.html',
})
export class ProfileMyPicturePage {

  pageTitle: string;
  imageUrl: string;
  imageList:string[];

  constructor(public navParams: NavParams,
              public navCtrl: NavController,
              public platform:Platform,
              private httpService:HttpService) {
    //const userId = navParams.get("userId");
    // TODO: fetch user pictures

    const title = navParams.get("title");
    this.pageTitle = !!title ? title : "所有图片";
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.getUserImages();
  }
  getUserImages(){
    this.httpService.GetUserImages().subscribe(res =>{
        this.imageList = res;
    });
  }
  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }
}
