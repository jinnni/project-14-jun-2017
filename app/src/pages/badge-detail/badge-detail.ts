import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform, ToastController} from "ionic-angular";
import {Badge} from "../../data/badge.interface";
import {Product} from "../../data/product.interface";
import {HttpService} from "../../services/httpService";
import {ProductDetailPage} from "../product-detail/product-detail";
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage({
  segment: "badge/:id"
})
@Component({
  selector: 'page-badge-detail',
  templateUrl: 'badge-detail.html',
})
export class BadgeDetailPage {
  pageNo:number = 0;
  badge: Badge;
  userBadgeList: any;
  currentScore:number;
  reviewScore:number;
  answerScore:number;
  goalScore:number;
  badgeId:any;
  imageUrl:any;
  relatedProducts: Product[];
  lastStartingPos: number;
  firstTimeFlag = true;
  isLast = false;
  onlyAddEightRelatedProducts = [];
  showMaxRelatedProducts = 8;
  fillSpace = 0;
  onIndex = 4;
  allRelatedProducts = [];
  checkerIndex = 0;
  resp = [];
  flag = 0;
  userId;
  constructor(private navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              private settingsProvider:SettingsProvider,
              private toastCtrl: ToastController,
              private httpService: HttpService) {
    this.badgeId= this.navParams.get("id");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.userId = localStorage.getItem("UserData.userId");
    this.fillSpace = 0;
    this.onlyAddEightRelatedProducts = [];
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      
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
    this.httpService.GetBadgeById(this.badgeId).subscribe(res =>{
        this.badge = res;
        this.goalScore = res.goalScore;
        this.reviewScore = res.reviewScore ;
        this.answerScore = res.answerScore ;
        this.relatedProducts = res.products;
      });
      this.pageNo = 0;
      this.fillSpace = 0;
      this.onlyAddEightRelatedProducts = [];
      this.getProductsByBadgeidPageable(this.pageNo);
      this.getAllBagdeListByUserId();
  }

  getAllBagdeListByUserId(){
    this.httpService.GetAllBagdeListByUserId(true).subscribe(res =>{
      this.userBadgeList =res;
    });
  }

  getProductsByBadgeidPageable(pageNo:number){
    var productList = [];
    var temp;
    var self = this;
    if(self.flag == 1){
      self.isLast = true;
      self.fillSpace = self.showMaxRelatedProducts - self.resp.length;
      for(let i = 0; i < self.fillSpace; i++, self.checkerIndex++){
        if(self.allRelatedProducts.length == (self.checkerIndex)){
          self.checkerIndex = 0;
        }
        self.resp[self.resp.length] = self.allRelatedProducts[self.checkerIndex];
      }
      if(self.pageNo == 1){
        for(let index = 0; index < self.resp.length; index++){
          self.resp[index].noRefresh = true;
        }
      }
      for(let index = 0; index < self.resp.length; index++){
        if(index == 4){
          temp = self.resp[index];
          productList[index] = self.resp[0];
        }else{
          productList[index] = self.resp[index];
        }
      }
      productList.push(temp);
      for(let index1 = 0; index1 < productList.length; index1++){
        self.onlyAddEightRelatedProducts[index1] = (productList[index1]);
      }
      self.resp = [];
      return;
    }
    this.httpService.GetProductsByBadgeidPageable(this.badgeId,pageNo).subscribe(res =>{
      // below block of commented code is for testing purpose
      // Do not remove
      // if first page has 8 product and next page is empty
      // if(pageNo == 1){
      //   var s = res;
      //   res = [];
      //   for(let index = 0; index < 8; index++){
      //     res[index] = s[index];
      //   }
      // }
      if(pageNo == 0){
        if(res.length == 0){
          self.isLast = true;
          return;
        }else if(res.length < self.showMaxRelatedProducts && res.length > 0){
          self.isLast = true;
          for(let index = 0; index < res.length; index++){
            res[index].singleProductImage = self.imageUrl + res[index].imageArray[0];
            res[index].noRefresh = true;
            productList[index] = res[index];
          }
        }else{
          self.isLast = false;
          for(let index = 0; index < res.length; index++){
            res[index].singleProductImage = self.imageUrl + res[index].imageArray[0];
            res[index].noRefresh = false;
            self.allRelatedProducts.push(res[index]);
            if(index == 4){
              temp = res[index];
              productList[index] = res[0];
            }else{
              productList[index] = res[index];
            }
          }
          productList.push(temp);
        }
      }else{
        if(res.length == 0){
          self.isLast = true;
          self.fillSpace = self.showMaxRelatedProducts - res.length;
          for(let i = 0; i < self.fillSpace; i++, self.checkerIndex++){
            self.flag = 1;
            res[i] = self.allRelatedProducts[self.checkerIndex];
          }
          if(self.pageNo == 1){
            for(let index = 0; index < res.length; index++){
              res[index].noRefresh = true;
            }
            let toast = this.toastCtrl.create({
              message: "无更多产品",//No more products available
              duration: 3000,
              position: 'bottom'
            });
            toast.present();
          }
          for(let index = 0; index < res.length; index++){
            if(index == 4){
              temp = res[index];
              productList[index] = res[0];
            }else{
              productList[index] = res[index];
            }
          }
          productList.push(temp);
        }else if(res.length < self.showMaxRelatedProducts && res.length > 0){
          self.isLast = true;
          self.fillSpace = self.showMaxRelatedProducts - res.length;
          for(let index = 0; index < res.length; index++){
            res[index].singleProductImage = self.imageUrl + res[index].imageArray[0];
            res[index].noRefresh = false;
            self.allRelatedProducts.push(res[index]);
          }
          for(let i = 0; i < self.fillSpace; i++, self.checkerIndex++){
            self.flag = 1;
            res[res.length] = self.allRelatedProducts[self.checkerIndex];
          }
          for(let index = 0; index < res.length; index++){
            if(index == 4){
              temp = res[index];
              productList[index] = res[0];
            }else{
              productList[index] = res[index];
            }
          }
          productList.push(temp);
        }else{
          self.isLast = false;
          for(let index = 0; index < res.length; index++){
            res[index].singleProductImage = self.imageUrl + res[index].imageArray[0];
            res[index].noRefresh = false;
            self.allRelatedProducts.push(res[index]);
            if(index == 4){
              temp = res[index];
              productList[index] = res[0];
            }else{
              productList[index] = res[index];
            }
          }
          productList.push(temp);
        }
      }
      for(let index1 = 0; index1 < productList.length; index1++){
        self.onlyAddEightRelatedProducts[index1] = (productList[index1]);
      }
    });
  }

  calculateWidth(): string {
    if(this.userBadgeList != null){
      for (let item of this.userBadgeList){
        if(item.badge.id == this.badgeId){
          if(item.point >= 100){
            this.currentScore = item.point;
            return 100 +"%";
          }
          else{
            this.currentScore = item.point;
            return item.point +"%";
          }
        }
      }
    }else{
      this.currentScore = 0;
      return 0 + "%";
    }
  }

  showProductDetail(productItem: Product) {
    this.navCtrl.push(ProductDetailPage, {
      item: productItem
    });
  }
  setRelatedProductsBeingShown(){
    if(this.isLast == false){
      this.pageNo++;
    }
    this.getProductsByBadgeidPageable(this.pageNo);
  }
}
