import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, Platform, LoadingController} from 'ionic-angular';
import {ProductListPage} from "../product-list/product-list";
//import {SignInUpPage} from "../sign-in-up/sign-in-up";
import {HttpService} from "../../services/httpService";
//import {GlobalVariable} from "../../global/global.variable";
import productCategories from "../../data/productCategories";
import { Util }  from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
import { StatusBar } from '@ionic-native/status-bar';
@IonicPage({
  segment: "productCategories"
})
@Component({
  selector: 'page-product-category',
  templateUrl: 'product-category.html'
})
export class ProductCategoryPage  {
  l1Categories = productCategories;
  l1CategoriesShown = [];
  CatId:any;
  SubCatData=[];
  DiffSubCatData=[];
  CatData:any;
  value:any;
  focusTitle:any;
  cat01=[];
  cat1:any=[];
  cat02=[];
  cat2=[];
  cat03=[];
  cat3=[];
  cat04=[];
  cat4=[];
  cat05=[];
  cat5=[];
  cat7=[];
  cat06=[];
  cat07=[];
  // cat08=[];
  // cat09=[];
  cat10=[];
  name:any;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public UserService:HttpService,
    public statusBar: StatusBar,
    public navParams: NavParams,
    private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.LoadSubCat();
    this.CatId= this.navParams.get("CatId");
    this.name=this.navParams.get("Name");
    this.value=this.CatId;
    this.l1Categories.forEach(l1Category => {
      this.l1CategoriesShown.push({
        id: l1Category.id,
        subCategories: l1Category.subCategories.slice(0, 6),
        didSeeAll: false
      });
    })
  }

  LoadSubCat(){
    this.UserService.GetSubCat().subscribe(res =>{
      this.CatData = res.data;
      this.Ar();
      this.Seperate();
    });

   }
   ionViewWillEnter(){
     Util.unRegisterBackButton(this.platform,this.navCtrl);
     this.settingsProvider.slider.stopAutoplay();
     if(this.platform.is("ios")){
      this.settingsProvider.statusBar.styleDefault();
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.styleLightContent();
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
   }
   ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.productSlider.stopAutoplay();
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.styleLightContent();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
          this.settingsProvider.productSlider.startAutoplay();
          this.settingsProvider.slider.startAutoplay();
          this.settingsProvider.statusBar.styleLightContent();
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

   Seperate()
   {
     let cat1sub = [];
     let cat2sub = [];
     let cat3sub = [];
     let cat4sub = [];
     let cat5sub = [];
     let cat7sub = [];
     for(let i = 0; i <12; i++)
     {
       if(typeof this.cat01[i] != 'undefined') cat1sub.push(this.cat01[i]);
       if(typeof this.cat02[i] != 'undefined') cat2sub.push(this.cat02[i]);
       if(typeof this.cat03[i] != 'undefined') cat3sub.push(this.cat03[i]);
       if(typeof this.cat04[i] != 'undefined') cat4sub.push(this.cat04[i]);
       if(typeof this.cat05[i] != 'undefined') cat5sub.push(this.cat05[i]);
       if(typeof this.cat07[i] != 'undefined') cat7sub.push(this.cat07[i]);
     }
     if(cat1sub.length>0) this.cat1.push(cat1sub);
     if(cat2sub.length>0) this.cat2.push(cat2sub);
     if(cat3sub.length>0) this.cat3.push(cat3sub);
     if(cat4sub.length>0) this.cat4.push(cat4sub);
     if(cat5sub.length>0) this.cat5.push(cat5sub);
     if(cat7sub.length>0) this.cat7.push(cat7sub);

     cat1sub = [];
     cat2sub = [];
     cat3sub = [];
     cat4sub = [];
     cat5sub = [];
     cat7sub = [];

     for(let i = 12; i <24; i++)
     {
       if(typeof this.cat01[i] != 'undefined') cat1sub.push(this.cat01[i]);
       if(typeof this.cat02[i] != 'undefined') cat2sub.push(this.cat02[i]);
       if(typeof this.cat03[i] != 'undefined') cat3sub.push(this.cat03[i]);
       if(typeof this.cat04[i] != 'undefined') cat4sub.push(this.cat04[i]);
       if(typeof this.cat05[i] != 'undefined') cat5sub.push(this.cat05[i]);
       if(typeof this.cat07[i] != 'undefined') cat7sub.push(this.cat07[i]);
     }
     if(cat1sub.length>0) this.cat1.push(cat1sub);
     if(cat2sub.length>0) this.cat2.push(cat2sub);
     if(cat3sub.length>0) this.cat3.push(cat3sub);
     if(cat4sub.length>0) this.cat4.push(cat4sub);
     if(cat5sub.length>0) this.cat5.push(cat5sub);
     if(cat7sub.length>0) this.cat7.push(cat7sub);

     cat1sub = [];
     cat2sub = [];
     cat3sub = [];
     cat4sub = [];
     cat5sub = [];
     cat7sub = [];
     for(let i = 24; i <36; i++)
     {
       if(typeof this.cat01[i] != 'undefined') cat1sub.push(this.cat01[i]);
       if(typeof this.cat02[i] != 'undefined') cat2sub.push(this.cat02[i]);
       if(typeof this.cat03[i] != 'undefined') cat3sub.push(this.cat03[i]);
       if(typeof this.cat04[i] != 'undefined') cat4sub.push(this.cat04[i]);
       if(typeof this.cat05[i] != 'undefined') cat5sub.push(this.cat05[i]);
       if(typeof this.cat07[i] != 'undefined') cat7sub.push(this.cat07[i]);
     }
     if(cat1sub.length>0) this.cat1.push(cat1sub);
     if(cat2sub.length>0) this.cat2.push(cat2sub);
     if(cat3sub.length>0) this.cat3.push(cat3sub);
     if(cat4sub.length>0) this.cat4.push(cat4sub);
     if(cat5sub.length>0) this.cat5.push(cat5sub);
     if(cat7sub.length>0) this.cat7.push(cat7sub);
   }

   Ar(){

     for(let item of this.CatData ){
       if(this.CatId == item.parentCategoryId){
         this.SubCatData.push(item);
       }else{
         this.DiffSubCatData.push(item);
       }
     }
     if(this.SubCatData.length>0){
       for(let item of this.SubCatData){
           this.cat07.push(item);
       }
     }

     for(let item of this.DiffSubCatData){
       if(1==item.parentCategoryId){
         this.cat01.push(item);
       }
       if(2==item.parentCategoryId){
         this.cat02.push(item);
       }
       if(3==item.parentCategoryId){
         this.cat03.push(item);
       }
       if(4==item.parentCategoryId){
         this.cat04.push(item);
       }
       if(5==item.parentCategoryId){
         this.cat05.push(item);
       }
     }

 }

  showProductsInCategory(l2CategoryId) {
    localStorage.setItem("productParentCategoryId",l2CategoryId.parentCategoryId);
    localStorage.setItem("CategoryId",l2CategoryId.id);
    this.navCtrl.push(ProductListPage, {
      categoryId: l2CategoryId
    });
  }

  getL1CategoryShown(l1CategoryId: number) {
    return this.l1CategoriesShown.find(l1Category => {
      return l1Category.id == l1CategoryId;
    });
  }

  showAll(l1CategoryId: number) {
    const l1CategoryShown = this.l1CategoriesShown.find(l1Category => {
      return l1Category.id == l1CategoryId;
    });
    l1CategoryShown.didSeeAll = true;
    const l1Category = this.l1Categories.find(l1Category => {
      return l1Category.id == l1CategoryId;
    });
    l1CategoryShown.subCategories = l1Category.subCategories;
  }

  seeMore(l1CategoryId: number, howMany: number) {
    // get the current category shown
    const l1CategoryShown = this.l1CategoriesShown.find(l1Category => {
      return l1Category.id == l1CategoryId;
    });
    // get corresponding category data
    const l1Category = this.l1Categories.find(l1Category => {
      return l1Category.id == l1CategoryId;
    });
    // check current count
    const currentCount = l1CategoryShown.subCategories.length;
    // if it's the last time able to do it
    if(currentCount + howMany >= l1Category.subCategories.length ){
      l1CategoryShown.didSeeAll = true;
    }
    // slice from 0 to the increased count
    l1CategoryShown.subCategories = l1Category.subCategories.slice(0, currentCount + howMany);
  }
}
