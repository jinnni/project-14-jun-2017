import {Component, Input, OnInit} from '@angular/core';
import {ProductQnaDetailPage} from "../../pages/product-qna/product-qna-detail/product-qna-detail";
import {NavController, App, AlertController} from "ionic-angular";
import {HttpService} from "../../services/httpService";
import {ProductService} from "../../services/productService";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {SignInUpPage} from "../../pages/sign-in-up/sign-in-up";
import {QnaItemType} from "../../global/qnaItemType";
import {Product} from "../../data/product.interface";
import {GlobalVariable} from "../../global/global.variable";
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
@Component({
  selector: 'component-qna-item',
  templateUrl: 'qna-item.html',
})
export class QnaItemComponent implements OnInit {

  QnaItemType = QnaItemType;
  imageUrl:string;
  socialProfilePic:string;
  simplifiedType: string;
  @Input() type: string;
  @Input() qnaData: any;
  @Input() productName?: string;
  @Input() dummyProdId?: number;
  product: any;
  userData: any;
  isGuestUser:boolean;

  constructor(private navCtrl: NavController,
              private appCtrl: App,
              private alertCtrl: AlertController,
              private httpService:HttpService,
              private productService: ProductService) {
                this.imageUrl = localStorage.getItem("myImageUrl");
                this.socialProfilePic = localStorage.getItem("socialProfilePic");
                this.userData =JSON.parse(localStorage.getItem("UserData"));
                if(GlobalVariable.isAuthUser){
                  this.isGuestUser = true;
                }else{
                  this.isGuestUser = false;
                }
  }

  // @Input properties are available in onInit
  ngOnInit() {
    this.simplifiedType = QnaItemType.getSimplifiedType(this.type);
    // if there is no product name input
    if (!this.productName) {
      this.product = this.productService.getProductById(this.dummyProdId);
      this.productName = this.product.name;
    }else{
      this.product = this.productService.getProductById(this.dummyProdId);
    }
  }

  showProduct() {
    this.navCtrl.push(ProductDetailPage, {item: this.product});
  }

  showProfile(user:any) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      if(user.id == localStorage.getItem("UserData.userId"))
      {
        this.navCtrl.popToRoot();
        this.navCtrl.parent.select(4);
      }else{
        this.navCtrl.push(ProfilePublicPage, {userData: this.qnaData.user});
      }
  	}
  }


  showQnaDetail(type: string) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      this.navCtrl.push(ProductQnaDetailPage, {
        type: type,
        qnaData: this.qnaData,
        productName: this.productName
      });
    }
  }

  /*Like UGC Data*/
  toggleLikeUp(item:any) {
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      if (item.hasOwnProperty('questionId')) {
        this.httpService.addLike(item.id,"/answer",true).subscribe(res =>{
          this.qnaData.liked = 1;
          this.qnaData.likeCount = this.qnaData.likeCount+1;
        });
      }else{
        this.httpService.addLike(item.id,"/question",true).subscribe(res =>{
          this.qnaData.liked = 1;
          this.qnaData.likeCount = this.qnaData.likeCount+1;
        });
      }
  	}
  }

  /*Dislike UGC Data*/
  toggleLikeDown(item:any){
    if(!GlobalVariable.isAuthUser){
      this.alertCtrl.create({
        title: "",
        message: "你必须登录才能看到此页面",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
      this.appCtrl.getRootNavs()[0].setRoot(SignInUpPage,{from: "reg"});
    }else{
      if (item.hasOwnProperty('questionId')) {
        this.httpService.removeLike(item.id,"/answer",true).subscribe(res =>{
          this.qnaData.liked = 0;
          this.qnaData.likeCount = this.qnaData.likeCount-1;
        });
      }else{
        this.httpService.removeLike(item.id,"/question",true).subscribe(res =>{
          this.qnaData.liked = 0;
          this.qnaData.likeCount = this.qnaData.likeCount-1;
        });
      }
    }
  }
  goToProfile(user:any){
    if(user.id == localStorage.getItem("UserData.userId")){
      this.navCtrl.popToRoot();
      this.navCtrl.parent.select(4);
    }else{
      this.navCtrl.push(ProfilePublicPage, {userData: user});
    }
  }
}
