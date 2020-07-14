import {Component, Injectable, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavController} from "ionic-angular";
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
import {Http} from "@angular/http";
import {HttpService} from "../../services/httpService";
import 'rxjs/add/operator/map';
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {UgcDetailPage} from "../../pages/ugc-detail/ugc-detail";
import { SettingsProvider } from '../../providers/settingsProvider';
import { SearchedProductListPage } from '../../pages/searched-product-list/searched-product-list';
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
  searchTerm: string = '';
  searchControl: FormControl;
  searching: any = false;
  blank: any = true;
  pageNo = 0;
  searchResponse: any = {countDetail:{}};
  constructor(
        private navCtrl: NavController,
        public http: Http,
        public dataService:HttpService,
        private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.searchControl = new FormControl();
    this.searchControl.valueChanges.debounceTime(700).subscribe(search => {
      document.getElementById('myinput').focus();
      this.getCount(search);
    });
    setTimeout(() => {
      let self = this;
      document.getElementById('myinput').addEventListener("blur",function(){
        if(self.searchTerm == ''){
          self.blank = false;
          self.settingsProvider.isMenuOpened = false;
          self.settingsProvider.isActivate = false;
          self.navCtrl.pop({animate:false});
        } 
      });
    }, 555);
  }
  toggleSearchBtn(){
    if(this.searchTerm != ''){
      this.blank = true;
      this.searchTerm = '';
      document.getElementById('myinput').focus();
      this.pageNo = 0;
      delete this.searchResponse.filteredItems;
    }
  }
  getCount(term){
    new Promise((resolve, reject) => {
      resolve();
    }).then(sourceType => {
      console.log(term.length);
      this.dataService.GetAllSearchableElementsCount(term).subscribe(res => {
        this.blank = false;
        this.searching = true;
        this.searchResponse.countDetail = res;
        let size = 20;
        this.pageNo = 0;
        if(this.searchResponse.countDetail['term'] != "" && (this.searchResponse.countDetail.product > 0 || this.searchResponse.countDetail.ugc > 0 || this.searchResponse.countDetail.user > 0)){
          this.dataService.GetAllSearchableElementsPaged(term, size, '', this.pageNo).subscribe(resp => {
            this.searchResponse.filteredItems = resp;
            this.searchResponse.filteredItems.last = resp.last;
          });
        } else {
          delete this.searchResponse.filteredItems;
        }
      });
    });
  }
  showList(category){
    switch (category) {
      case 'product':
        this.navCtrl.push(SearchedProductListPage,{title:this.searchResponse.countDetail['term'],list:''});
        break;
      case 'ugc':
        this.navCtrl.push(SearchedUgcListPage,{title:this.searchResponse.countDetail['term'],list:''});
        break;
      case 'user':
        this.navCtrl.push(SearchedUserListPage,{title:this.searchResponse.countDetail['term'],list:''});
        break;
      default:
        break;
    }
  }
  showDetail(category,data:any){
    let item:any;
    if(data == ''){
      for (let index = 0; index < this.searchResponse.filteredItems.content.length; index++) {
        if (this.searchResponse.filteredItems.content[index].searchObjectType == category) {
          item = this.searchResponse.filteredItems.content[index];
        }
      }
    } else {
      item = data.id;
    }
    switch (category) {
      case 'product':
        this.dataService.GetProductByID(item.id).subscribe(res => {
          this.navCtrl.push(ProductDetailPage, {item:res.data});
        });
        break;
      case 'ugc':
        this.dataService.GetUGCById(item.id).subscribe(res => {
          this.navCtrl.push(UgcDetailPage, {item: res,id: res.id,status: "none"});
        });
        break;
      case 'user':
        if(item.id == localStorage.getItem("UserData.userId")){
          this.navCtrl.pop();
          this.navCtrl.parent.select(4);
        }else{
          this.dataService.GetPublicCountDetail(item.id).subscribe(res => {
            this.navCtrl.push(ProfilePublicPage, {userData: res});
          });
        }
        break;
      default:
        break;
    }
    
  }
  onSearchInput(){
    this.searching = true;
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
  pagination(infiniteScroll){
    this.pageNo++;
    if(this.searchResponse.countDetail['term'] != "" && (this.searchResponse.countDetail.product > 0 || this.searchResponse.countDetail.ugc > 0 || this.searchResponse.countDetail.user > 0)){
      this.dataService.GetAllSearchableElementsPaged(this.searchResponse.countDetail['term'], 15, '', this.pageNo).subscribe(resp => {
        for (let index = 0; index < resp.content.length; index++) {
          this.searchResponse.filteredItems.content.push(resp.content[index]);
        }
        this.searchResponse.filteredItems.last = resp.last;
      });
    }
    if(infiniteScroll!=''){
      infiniteScroll.complete();
    }
  }
}
