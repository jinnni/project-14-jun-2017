import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { HttpService } from '../../services/httpService';
import { ProductDetailPage } from '../../pages/product-detail/product-detail';
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-searched-product-list',
  templateUrl: 'searched-product-list.html',
})
export class SearchedProductListPage {
  list:any;
  searchProductList:any;
  searchtext:string;
  imageUrl:string;
  lastPage:boolean = false;
  pageNo = 0;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public platform: Platform,
    private settingsProvider:SettingsProvider,
    public dataService:HttpService) {
    this.dataService.toggleLoader("ugc-loader",true);
    this.list = navParams.get("list");
    this.searchtext = navParams.get("title");
    this.imageUrl = localStorage.getItem("myImageUrl");
  }
  doInfinite(infiniteScroll) {
    this.pageNo++;
    this.dataService.SearchProductObject(this.searchtext,this.pageNo).subscribe(res => {
      if (res.length < 1){this.lastPage = true;}
      for(let ind = 0; ind<res.length; ind++){
        this.searchProductList.push(res[ind]);
      }
    });
    infiniteScroll.complete();
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
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    new Promise((resolve,reject) => {
      resolve();
    }).then(sourceType =>{
      this.searchProductList = [];
      this.dataService.SearchProductObject(this.searchtext,this.pageNo).subscribe(res => {
        console.log(res);
        this.searchProductList = res;
        if(this.pageNo == 0){
          this.dataService.getAllImagesWithClassname("ugc-loader",'page-searched-product-list');
        }
      },error =>{
        if(this.pageNo == 0){
          this.dataService.getAllImagesWithClassname("ugc-loader",'page-searched-product-list');
        }
      });
    }).then(sourceType =>{
    });
  }
  showProduct(productItem:any) {
    this.navCtrl.push(ProductDetailPage, {item:productItem});
  }
}
