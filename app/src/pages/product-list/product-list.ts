import {Component,ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams,Content, Platform} from 'ionic-angular';
import {ProductDetailPage} from "../product-detail/product-detail";
import {Product} from "../../data/product.interface";
import {HttpService} from "../../services/httpService";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';


@IonicPage({
  segment: "productList/:categoryId"
})
@Component({
  selector: 'page-product-list',
  templateUrl: 'product-list.html'
})
export class ProductListPage {
  @ViewChild(Content) content: Content;
  categoryId: number;
  initial:boolean = false;
  productId:any;
  productParentId:any;
  imageUrl:string;
  ProductData0=[];
  ProductData1=[];
  ProductData2=[];
  ProductDataList0=[];
  ProductDataList1=[];
  ProductDataList2=[];
  ProductPartnerDataList=[];
  isScroll:boolean;
  lastPage0:boolean = false;
  lastPage1:boolean = false;
  lastPage2:boolean = false;
  pageTabs:any = "tab1";
  pageNo0:number = 0;
  pageNo1:number = 0;
  pageNo2:number = 0;
  clearto;
  selectedUgcTab = 1;
  callApi0=false;
  callApi1=false;
  callApi2=false;
  mainIndex = 0;
  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              public UserService:HttpService,
              private settingsProvider:SettingsProvider) {
    this.UserService.toggleLoader("ugc-loader",true);
    this.categoryId = navParams.get("categoryId");
    this.productId=localStorage.getItem("CategoryId");
    this.productParentId=localStorage.getItem("productParentCategoryId");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.selectedUgcTab = 1;
    // this.selectedTab(0);
    this.LoadSubCat0("reviewCount","DESC");
  }
  doInfinite0(infiniteScroll) {
    this.pageNo0++;
    this.LoadSubCat0("reviewCount","DESC");
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }
  LoadSubCat0(sortby,dir){
    this.callApi0 = true;
    this.UserService.GetProductsByCatSortedPageable(this.productId,this.pageNo0,sortby,dir).subscribe(res =>{
      if (res.length < 1){this.lastPage0 = true;}
      this.ProductData0 = [];
      for(let ind = 0; ind<res.length; ind++){
        this.ProductData0.push(res[ind]);
      }
      for(let item of this.ProductData0 ){
        if(item.productCategory!==undefined) {
          if (this.productParentId == item.productCategory.parentCategoryId) { 
            if(item.price == null) item.price = 0;   
            this.ProductDataList0.push(item);
          }
        }
      }
      if(this.pageNo0 == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-product-list');
      }
      this.initial = true;
      this.selectedTab(0);
    },error =>{
      if(this.pageNo0 == 0){
        this.UserService.getAllImagesWithClassname("ugc-loader",'page-product-list');
      }
    });
  }
  doInfinite1(infiniteScroll) {
    this.pageNo1++;
    this.LoadSubCat1("price","ASC");
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }
  LoadSubCat1(sortby,dir){
    this.callApi1 = true;
    this.UserService.GetProductsByCatSortedPageable(this.productId,this.pageNo1,sortby,dir).subscribe(res =>{
      if (res.length < 1){this.lastPage1= true;}
      this.ProductData1 = [];
      for(let ind = 0; ind<res.length; ind++){
        this.ProductData1.push(res[ind]);
      }
      for(let item of this.ProductData1 ){
        if(item.productCategory!==undefined) {
          if (this.productParentId == item.productCategory.parentCategoryId) { 
            if(item.price == null) item.price = 0;   
            this.ProductDataList1.push(item);
          }
        }
      }
    });
  }
  doInfinite2(infiniteScroll) {
    this.pageNo2++;
    this.LoadSubCat2("rating","DESC");
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }
  LoadSubCat2(sortby,dir){
    this.callApi2 = true;
    this.UserService.GetProductsByCatSortedPageable(this.productId,this.pageNo2,sortby,dir).subscribe(res =>{
      if (res.length < 1){this.lastPage2= true;}
      this.ProductData2 = [];
      for(let ind = 0; ind<res.length; ind++){
        this.ProductData2.push(res[ind]);
      }
      for(let item of this.ProductData2 ){
        if(item.productCategory!==undefined) {
          if (this.productParentId == item.productCategory.parentCategoryId) { 
            if(item.price == null) item.price = 0;   
            this.ProductDataList2.push(item);
          }
        }
      }
    });
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
      this.settingsProvider.statusBar.styleDefault();
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.styleLightContent();
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl);
  }

  scrollHandler(event) {
    if(event.scrollTop > 700){
      this.isScroll = true;
    }else{
      this.isScroll = false;
    }
  }
  scrollTop(){
    this.content.scrollToTop(1200);
    this.isScroll = false;
  }
  showProduct(productItem: Product) {
    this.navCtrl.push(ProductDetailPage, {item:productItem});
  }

  selectedTab(index:number)
  {
    this.mainIndex = index;
    switch(index){
      case 0:
      if(this.callApi0 == false){
        this.LoadSubCat0("reviewCount","DESC");
      }
      break;
      case 1:
      if(this.callApi1 == false){
        this.LoadSubCat1("price","ASC");
      }
      break;
      case 2:
      if(this.callApi2 == false){
        this.LoadSubCat2("rating","DESC");
      }
      break;
    }
  }
}
