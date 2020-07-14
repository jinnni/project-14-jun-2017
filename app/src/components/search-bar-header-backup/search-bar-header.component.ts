import {Component, Injectable, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavController} from "ionic-angular";
import {QrCodeScanPage} from "../../pages/qr-code-scan/qr-code-scan";
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import {Http} from "@angular/http";
import {HttpService} from "../../services/httpService";
import 'rxjs/add/operator/map';
import {Product} from "../../data/product.interface";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {UgcDetailPage} from "../../pages/ugc-detail/ugc-detail";
import {ArticleDetailPage} from "../../pages/article-detail/article-detail";
import { SettingsProvider } from '../../providers/settingsProvider';
import { SearchedProductListPage } from '../../pages/searched-product-list/searched-product-list';
import { SearchedArticleListPage } from '../../pages/searched-article-list/searched-article-list';
import { SearchedUgcListPage } from '../../pages/searched-ugc-list/searched-ugc-list';
import { ProfilePublicPage } from '../../pages/profile-public/profile-public';
import { SearchedUserListPage } from '../../pages/searched-user-list/searched-user-list';

@Component({
  selector: 'component-search-bar-header',
  templateUrl: 'search-bar-header.html',
  changeDetection: ChangeDetectionStrategy.Default
})
@Injectable()
export class SearchBarHeaderComponent {
  
  productCollection: any;
  productCollectionLength: any;
  productSearchList: any;
  finalProductCollection: any;
  finalProductCollectionSimilar: any =[];

  articleCollection: any;
  articleCollectionLength: any;
  articleSearchList: any;
  finalArticleCollection: any;
  finalArticleCollectionSimilar: any =[];

  ugcCollection: any;
  ugcCollectionLength: any;
  ugcSearchList: any;
  finalUgcCollection: any;
  finalUgcCollectionSimilar: any =[];

  userCollection: any;
  userCollectionLength: any;
  userSearchList: any;
  finalUserCollection: any;
  finalUserCollectionSimilar:any =[];

  searchTerm: string = '';
  searchControl: FormControl;
  searching: any = false;
  blank: any = true;
  // searchByPage: number = 0;
  objectsArray = [];
  allElements:any;
  constructor(
        private navCtrl: NavController,
        public http: Http,
        public dataService:HttpService,
        private changeDetectorRef: ChangeDetectorRef,
        private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.searchControl = new FormControl();
    this.dataCallForSearch();
    var self=this;
    setTimeout(() => {
      this.searchTerm = '';
      this.blank = true;
      document.getElementById('myinput').focus();
      document.getElementById('myinput').addEventListener("blur",function(){
        if(self.searchTerm == ''){
          self.settingsProvider.isMenuOpened = false;
          self.settingsProvider.isActivate = false;
          self.navCtrl.pop({animate:false});
          self.changeDetectorRef.detectChanges();
        }
      });
    },500);
  }
  
  toggleSearchBtn(){
    if(this.searchTerm != ''){
      this.blank = true;
      this.searchTerm = '';
      document.getElementById('myinput').focus();
      this.changeDetectorRef.detectChanges();
    }
  }
  getInnerText(dom){
    let regex = /(<([^>]+)>)/ig;
    let body = dom;
    let result = body.replace(regex, " ");
    result = result.replace(/<img[^>]*>/g," ");
    result = result.replace(/[？。、：，,.]+/g," ");
    result = result.replace(/\s+/g, " ");
    result = result.replace(/&nbsp;/g,"");
    return result;
  }
  splitContent(content){
    let splitted = content.split(/[，,.]+/);
    return splitted;
  }
  getCount(){
    new Promise((resolve, reject) => {
      resolve();
    }).then(sourceType => {
      this.dataService.GetAllSearchableElements().subscribe(res => {
        this.allElements = res;
        let temp = '';
        if (this.allElements["products"].length > 0){
          for (let obj in this.allElements["products"]) {
            temp = '';
            temp += this.allElements["products"][obj].hasOwnProperty("nameEn") ? this.getInnerText(this.allElements["products"][obj].nameEn) : '';
            temp += " ";
            temp += this.allElements["products"][obj].hasOwnProperty("name") ? this.getInnerText(this.allElements["products"][obj].name) : '';
            this.productSearchList.push({
              "title": temp,
              "id": this.allElements["products"][obj].id
            });
          }
        }
        if (this.allElements["ugcs"].length > 0){
          for (let obj in this.allElements["ugcs"]) {
            temp = '';
            temp += this.allElements["ugcs"][obj].hasOwnProperty("title") ? this.getInnerText(this.allElements["ugcs"][obj].title) : '';
            temp += " ";
            temp += this.allElements["ugcs"][obj].hasOwnProperty("content") ? this.getInnerText(this.allElements["ugcs"][obj].content) : '';
            this.ugcSearchList.push({
              "title": temp,
              "id": this.allElements["ugcs"][obj].id
            });
          }
        }
        if (this.allElements["users"].length > 0){
          for (let obj in this.allElements["users"]) {
            temp = '';
            temp += this.allElements["users"][obj].hasOwnProperty("nickname") ? this.getInnerText(this.allElements["users"][obj].nickname) : '';
            temp += " ";
            temp += this.allElements["users"][obj].hasOwnProperty("name") ? this.getInnerText(this.allElements["users"][obj].name) : '';
            this.userSearchList.push({
              "title": temp,
              "id": this.allElements["users"][obj].id
            });
          }
        }
        this.setFilteredItems();
      });
      
      this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
        this.blank = false;
        this.searching = false;
        this.setFilteredItems();
        if(this.searchTerm == ''){
          this.blank = true;
        }
      });
    });
  }
  dataCallForSearch(){
    this.productSearchList = [];
    this.articleSearchList = [];
    this.ugcSearchList = [];
    this.userSearchList = [];
    new Promise((resolve, reject) => {
      resolve();
    }).then(sourceType => {
      this.dataService.GetAllSearchableElements().subscribe(res => {
        this.allElements = res;
        let temp = '';
        if (this.allElements["products"].length > 0){
          for (let obj in this.allElements["products"]) {
            temp = '';
            temp += this.allElements["products"][obj].hasOwnProperty("nameEn") ? this.getInnerText(this.allElements["products"][obj].nameEn) : '';
            temp += " ";
            temp += this.allElements["products"][obj].hasOwnProperty("name") ? this.getInnerText(this.allElements["products"][obj].name) : '';
            this.productSearchList.push({
              "title": temp,
              "id": this.allElements["products"][obj].id
            });
          }
        }
        // if (this.allElements["articles"].length > 0){
        //   for (let obj in this.allElements["articles"]) {
        //     temp = '';
        //     temp += this.allElements["articles"][obj].hasOwnProperty("title") ? this.getInnerText(this.allElements["articles"][obj].title) : '';
        //     this.articleSearchList.push({
        //       "title": temp,
        //       "id": this.allElements["articles"][obj].id
        //     });
        //   }
        // }
        if (this.allElements["ugcs"].length > 0){
          for (let obj in this.allElements["ugcs"]) {
            temp = '';
            temp += this.allElements["ugcs"][obj].hasOwnProperty("title") ? this.getInnerText(this.allElements["ugcs"][obj].title) : '';
            temp += " ";
            temp += this.allElements["ugcs"][obj].hasOwnProperty("content") ? this.getInnerText(this.allElements["ugcs"][obj].content) : '';
            this.ugcSearchList.push({
              "title": temp,
              "id": this.allElements["ugcs"][obj].id
            });
          }
        }
        if (this.allElements["users"].length > 0){
          for (let obj in this.allElements["users"]) {
            temp = '';
            temp += this.allElements["users"][obj].hasOwnProperty("nickname") ? this.getInnerText(this.allElements["users"][obj].nickname) : '';
            temp += " ";
            temp += this.allElements["users"][obj].hasOwnProperty("name") ? this.getInnerText(this.allElements["users"][obj].name) : '';
            this.userSearchList.push({
              "title": temp,
              "id": this.allElements["users"][obj].id
            });
          }
        }
        this.setFilteredItems();
      });
      
      this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
        this.blank = false;
        this.searching = false;
        this.setFilteredItems();
        if(this.searchTerm == ''){
          this.blank = true;
        }
      });
    });
  }
  productFilterSearch(list,searchTerm){
    return list.filter((item) => {
      if(item.title.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){
        item.term = searchTerm;
        return item;
      }
    });
  }
  productFilterSearchNew(list,searchTerm){
    return list.filter((item) => {
      let c = this.filterer(item.title,searchTerm);
      item.term = c;
      return item;
    });
  }
  onSearchInput(){
    this.searching = true;
  }
  combineDuplicateObject(collection){
    let consolidate = [];
    let groupDuplicates = function(coll, title) {
      return coll.reduce(function(val, item) {
        (val[item[title]] = val[item[title]] || []).push(item);
        return val;
      }, {});
    };
    let groupedSearch = groupDuplicates(collection, 'title')
    for (let prop in groupedSearch ) {
      let y = this.filterer(groupedSearch[prop][0].title,groupedSearch[prop][0].term);
      if(y != ""){
        groupedSearch[prop].term = y;
        consolidate.push([prop, groupedSearch[prop]]);
      }
    }
    return consolidate;
  }
  filterer(value:string, similarText:string){
    let x = value.replace(/\s+/g, " ").trim();
    let y = x.split(" ");
    var regEx = new RegExp(similarText, 'gi');
    for(let index = 0; index < y.length; index++){   
      if(regEx.test(y[index]) == true){
        value = y[index];
        break;
      }
      else{
        value = "";
      }
    }
    return value;
  }
  consolidateObjects(collection){
    let consolidateSimilar = [];
    let groupDuplicates = function(coll, title) {
      return coll.reduce(function(val, item) {
        (val[item[title]] = val[item[title]] || []).push(item);
        return val;
      }, {}); 
    };
    let groupedSearchSimilar = groupDuplicates(collection, 'term');
    for (let prop in groupedSearchSimilar) {
      consolidateSimilar.push([prop, groupedSearchSimilar[prop]]);
    }
    return consolidateSimilar;
  }
  uniq(a, param){
    return a.filter(function(item, pos, array){
        return array.map(function(mapItem){ return mapItem[param]; }).indexOf(item[param]) === pos;
    })
  }
  ultraFilter(collection){
    let coll = [];
    for(let i in collection){
      if(collection[i].term != ""){
        coll.push(collection[i]);
      }
    }
    return coll;
  }
  groupObject(collection,searchTerm){
    let y = [];
    let z = [];
    for(let x in collection){
      if(collection[x].term != ""){
        y.push(collection[x]);
      }
    }
    z.push([searchTerm,y]);
    return z;
  }
  setFilteredItems() {
    this.productCollection = this.productFilterSearchNew(this.productSearchList,this.searchTerm);
    this.finalProductCollectionSimilar = this.consolidateObjects(this.ultraFilter(this.productCollection));
    this.finalProductCollection = this.groupObject(this.productCollection,this.searchTerm);
    this.productCollectionLength = this.finalProductCollection[0][1].length;
    // this.articleCollection = this.productFilterSearchNew(this.articleSearchList,this.searchTerm);
    // this.finalArticleCollectionSimilar = this.consolidateObjects(this.ultraFilter(this.articleCollection));
    // this.finalArticleCollection = this.groupObject(this.articleCollection,this.searchTerm);
    // this.articleCollectionLength = this.finalArticleCollection[0][1].length;
    this.ugcCollection = this.productFilterSearchNew(this.ugcSearchList,this.searchTerm);
    this.finalUgcCollectionSimilar = this.consolidateObjects(this.ultraFilter(this.ugcCollection));
    this.finalUgcCollection = this.groupObject(this.ugcCollection,this.searchTerm);
    this.ugcCollectionLength = this.finalUgcCollection[0][1].length;
    this.userCollection = this.productFilterSearchNew(this.userSearchList,this.searchTerm);
    this.finalUserCollectionSimilar = this.consolidateObjects(this.ultraFilter(this.userCollection));
    this.finalUserCollection = this.groupObject(this.userCollection,this.searchTerm);
    this.userCollectionLength = this.finalUserCollection[0][1].length
  }
  showProductDetail(productItem: Product) {
    this.dataService.GetProductByID(productItem[0].id).subscribe(res => {
      this.navCtrl.push(ProductDetailPage, {item:res.data});
    });
  }
  showProductsList(list) {
    this.navCtrl.push(SearchedProductListPage,{title:this.searchTerm,list:list});
  }
  showArticleDetail(list) {
    this.dataService.GetTimelineById(list[0].id).subscribe(res => {
      this.navCtrl.push(ArticleDetailPage, {item: res,id: res.id,status: "none"});
    });
  }
  showArticleList(list) {
    this.navCtrl.push(SearchedArticleListPage,{title:this.searchTerm,list:list});
  }
  showUgcDetail(list, status) {
    this.dataService.GetUGCById(list[0].id).subscribe(res => {
      this.navCtrl.push(UgcDetailPage, {item: res,id: res.id,status: "none"});
    });
  }
  showUgcList(list){
    this.navCtrl.push(SearchedUgcListPage,{title:this.searchTerm,list:list});
  }
  showUserDetail(list, status) {
    console.log(list);
    
    // this.dataService.GetUserById(list[0].id).subscribe(res => {
    //   this.navCtrl.push(ProfilePublicPage, {item: res,id: res.id,status: "none"});
    // });
   if(list[0].id == localStorage.getItem("UserData.userId")){
    this.navCtrl.pop();
      this.navCtrl.parent.select(4);
    }else{
      this.dataService.GetPublicCountDetail(list[0].id).subscribe(res => {
        this.navCtrl.push(ProfilePublicPage, {userData: res});
      });
    }
  }
  showUserList(list){
    this.navCtrl.push(SearchedUserListPage,{title:this.searchTerm,list:list});
  }
  getCountStyle(count:any) {
    if(Number(count) > 0 && Number(count) < 1000){
      return count;
    }
    if(Number(count)<1000000){
      let countText = (Number(count)/1000 | 0) + 'k';
      return countText;
    }
    else{
      let countText = (Number(count)/1000000).toString();
      if(countText.indexOf('.') !== -1)
      {
        countText = countText.substr(0, countText.indexOf('.')+2) + 'M';
      } else {
        countText = countText.length > 3 ? countText.substring(0,3) : countText + 'M';
      }
      return countText;
    }
  }
  scanQrCode() {
    this.navCtrl.push(QrCodeScanPage);
  }
}
