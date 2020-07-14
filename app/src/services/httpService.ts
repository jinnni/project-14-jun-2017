import {Injectable} from "@angular/core";
import {Headers, Http, RequestMethod, RequestOptions, RequestOptionsArgs} from "@angular/http";
import {AppSettings} from "../app/app.settings";
import {GlobalVariable} from "../global/global.variable";
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";
import {Platform, AlertController, Events, LoadingController} from 'ionic-angular';
import {error} from "util";
import {el} from "@angular/platform-browser/testing/src/browser_util";
import {map} from "rxjs/operator/map";
import {FileTransfer, FileTransferObject, FileUploadOptions} from "@ionic-native/file-transfer";
import {ImageResizer, ImageResizerOptions} from "@ionic-native/image-resizer";
import {File} from "@ionic-native/file";
import {async} from "rxjs/scheduler/async";
import {tryCatch} from "rxjs/util/tryCatch";
import { Network } from "@ionic-native/network";
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { StringifyOptions } from "querystring";
import { Util } from "../global/util";

declare let Wechat: any;
declare let WeiboSDK: any;

export enum ConnectionStatus {
  Online,
  Offline
}
@Injectable()
export class HttpService {
  static baseUrl = AppSettings.BASE_URL;
  static SERVER_HEADER_TOKEN_KEY = "Authorization";
  internetStatus: any = '';
  navigator: any;
  weibo_login_followers_count: any = null;
  weChatInstalledIos: boolean = true
  weiboSDKInstalledIos: boolean = true
  isTimeLnePage: boolean

  public status: ConnectionStatus;
  private _status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(null);
  loaderElement:any;
  constructor(private http: Http,
              private platform: Platform,
              private imageResizer: ImageResizer,
              private file: File,
              private transfer: FileTransfer,
              private alertCtrl: AlertController,
              private network: Network,
              private event: Events,
              private loadingCtrl:LoadingController) {
                /**  */
    this.startSpinner(true,'正在发布中',"ugc-loader",0);

    setTimeout(() => {
      if(this.isTimeLnePage){
       // alert('!')
        return;
      }
      this.toggleLoader("ugc-loader",false);
  
  }, 1000);


    this.status = ConnectionStatus.Online;
    this.checkWeChatWeiboInstalled();
  }

  startSpinner(isCustom:boolean, message:string, styleClass:string, duration) {
    message = message != '' ? message : "正在发布中"
    let loader;
    if(isCustom === true){
      loader = this.loadingCtrl.create({
        cssClass: styleClass,
        showBackdrop: false,
        spinner: 'hide',
        content: '<div class="custom-spinner-container"><div class="custom-spinner-box"><img src="assets/img/icons/pjd_loader.gif"></div><div class="text-info">'+ message +'</div></div>'
      });
    }else{
      if(duration != undefined || duration != ''){
        loader = this.loadingCtrl.create({
          cssClass: styleClass,
          spinner: 'dots',
          content: message,
          duration: duration
        });
      }else{
        loader = this.loadingCtrl.create({
          cssClass: styleClass,
          spinner: 'dots',
          content: message
        });
      }
    }
    loader.present();
    
    this.loaderElement = document.querySelector("." + styleClass);
  }


  startSpinnerCustom(isCustom:boolean, message:string, styleClass:string, duration) {
    message = message != '' ? message : "正在发布中"
    let loader;
    if(isCustom === true){
      loader = this.loadingCtrl.create({
        cssClass: styleClass,
        showBackdrop: false,
        spinner: 'hide',
        content: '<div class="custom-spinner-container"><div class="custom-spinner-box"><img src="assets/img/icons/pjd_loader.gif"></div><div class="text-info">'+ message +'</div></div>'
      });
    }else{
      if(duration != undefined || duration != ''){
        loader = this.loadingCtrl.create({
          cssClass: styleClass,
          spinner: 'dots',
          content: message,
          duration: duration
        });
      }else{
        loader = this.loadingCtrl.create({
          cssClass: styleClass,
          spinner: 'dots',
          content: message
        });
      }
    }
    loader.present();
    
    this.loaderElement = document.querySelector("." + styleClass);
  }

 
  public toggleLoader(styleClass:string, show:boolean){
    this.loaderElement = document.querySelector("." + styleClass);
    if(!this.loaderElement ) return;
    this.loaderElement.classList.add("show-loader");
    if(show == true){
      this.loaderElement.classList.remove("hide-loader");
      this.loaderElement.classList.add("show-loader");
    }else{
      this.loaderElement.classList.add("hide-loader");
      this.loaderElement.classList.remove("show-loader");
    }
  }
  public getAllImagesWithClassname(styleClass:string,parentElementName:string){

    if(!this.loaderElement){
      return;
    }
    if(parentElementName == ""){
      this.loaderElement.classList.add("hide-loader");
      this.loaderElement.classList.remove("show-loader");
    }
    var self = this;
    setTimeout(function(){
      var imgElement = document.querySelectorAll(parentElementName +" img");
      var imgSrcArray = [];
      for (let index = 0; index < imgElement.length; index++) {
        imgSrcArray.push(imgElement[index].getAttribute("src"));
      }
      self.preloadimages(imgSrcArray).done(function(images){
        self.toggleLoader(styleClass,false);
      })
    },1000);
  }
  public preloadimages(arr){
    var newimages=[], loadedimages=0;
    var postaction=function(x){}
    var arr=(typeof arr!="object")? [arr] : arr
    function imageloadpost(){
        loadedimages++
        if (loadedimages==arr.length){
            postaction(newimages)
        }
    }
    for (var i=0; i<arr.length; i++){
        newimages[i]=new Image()
        newimages[i].src=arr[i];
        newimages[i].onload=function(image){
          imageloadpost()
        }
        newimages[i].onerror=function(e){}
    }
    return {
        done:function(f){
            postaction=f || postaction
        }
    }
  }
  /*Setting Headers For the API Call*/
  getDefaultHeader(withToken: boolean): Headers {
    const header = new Headers();
    header.set("Content-Type", "application/json");
    if (withToken) {
      header.set(HttpService.SERVER_HEADER_TOKEN_KEY, "Bearer " + GlobalVariable.token);
    }
    return header;
  }

  getConfigs() {
    console.log("@getConfigs")
    return this.http
    .get(HttpService.baseUrl + "/admin/config")
    .map(res => res.json());
  }

  addReferral(refcode: string){

    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/setReferral/"+refcode, reqOption).map(res => res.json()).catch(this.handleError);
    }
    
  }

  checkWeChatWeiboInstalled() {
    this.platform.ready().then(() => {
      if (this.platform.is("cordova")) {
        Wechat.isInstalled(installed => {
          console.log("Wechat installed: " + (installed ? "Yes" : "No"));
          this.weChatInstalledIos = installed
        }, (reason) => {
          console.log("Failed: " + reason);
        });

        WeiboSDK.checkClientInstalled(() => {
          console.log("Weibo installed")
          this.weiboSDKInstalledIos = true
        }, () => {
          console.log("Weibo not installed")
          this.weiboSDKInstalledIos = false
        });
      }
    });
  }


  /*GET Method For the HTTP with flag 'withToken'*/
  get(path: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .get(HttpService.baseUrl + path,
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  /*POST method for HTTP with flag 'withToken'*/
  post(path: string, body: object, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .post(HttpService.baseUrl + path, JSON.stringify(body),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  postWithExceptionHandleLogin(path: string, body: object, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .post(HttpService.baseUrl + path, JSON.stringify(body),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(error => Observable.of(error.json()));
    }
  }

  /*PUT method for HTTP with flag 'withToken'*/
  put(path: string, body: object, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + path, JSON.stringify(body),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }
  changePhoneNumber(path: string, body: object, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + path, JSON.stringify(body),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }
  /*Used to update User Data but not really know how it work's*/
  putUserInfo(path: string, body: object, authToken: string) {
    if (this.isOnline()) {
      const header = new Headers();
      header.set("Content-Type", "application/json");
      header.set("Authorization", authToken);
      return this.http
        .put(HttpService.baseUrl + path, JSON.stringify(body),
          new RequestOptions({headers: header}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  /*User to submit Multipat Data, But not Used*/
  postFormData(path: string, formData: FormData, withToken: boolean = true) {
    if (this.isOnline()) {
      const header = this.getDefaultHeader(withToken);
      header.set("Content-Type", "multipart/form-data");
      return this.http
        .post(HttpService.baseUrl + path, formData,
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  /*Get Answer of the Question By Question ID*/
  GetAnswerListByQuestionId(questionId: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/answer/question/" + questionId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Get Question On the Product Detail Page*/
  GetQuestionProductById(productId: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/question/product/" + productId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  UpdateProductReview(body){
    if (this.isOnline()) {
      const header = this.getDefaultHeader(true);
      header.set("Content-Type", "application/json");
      return this.http
      .put(HttpService.baseUrl + "/review", JSON.stringify(body),
      new RequestOptions({headers: this.getDefaultHeader(true)}))
      .map(res => res.json())
      .catch(this.handleError);
    }
  }

  /*Get Review On the Product Detail Page*/
  GetProductReviewById(productId: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/review/product/" + productId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductReviewByIdPageNo(productId: number, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/review/" + pageNo + "/list/" + productId, reqOption).map(res => res.json()).catch(this.handleError);
      ;
    }
  }
  GetProductReviewByUserIdFollowedByOthersReview(productId,pageNo,size) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/review/product/"+ productId +"/user/" + localStorage.getItem("UserData.userId")+"/page/"+pageNo+"?size="+size).map(res => res.json()).catch(this.handleError);
    }
  }
  /*Get Review By User Id*/
  GetProductReviewByUserId() {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/review/user/" + localStorage.getItem("UserData.userId")).map(res => res.json()).catch(this.handleError);
    }
  }
  GetProductReviewByUserIdPageableSize(pageno,size, userId?) {
    if (this.isOnline()) {
      if(!userId) userId = localStorage.getItem("UserData.userId");
      return this.http.get(HttpService.baseUrl + "/review/user/" + userId +'/page/'+pageno+'?size='+size).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductReviewReportByUserId() {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/product-review-reports").map(res => res.json()).catch(this.handleError);
    }
  }

  PostCreateUGCContent(data: any) {
    if (this.isOnline()) {
      return this.post("/ugc", data, true);
    }
  }



  /*Get Featured UGC by most like count (Sorted by Like Count) with Pagination*/
  GetUGCList(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/most/like/featured/list/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

/*Get Featured UGC by most like count (Sorted by Like Count) with Pagination*/
GetUGCListPageInfoSize(withToken: boolean, pageNo: number, size) {

  if (this.isOnline()) {
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(withToken)
    });
    return this.http.get(HttpService.baseUrl + "/ugc/most/like/featured/admin/list/" + pageNo +'?size='+size, reqOption).map(res => res.json()).catch(this.handleError);
  }
}


  /*Get UGC For the Timeline Page*/
  GetUGC(withToken: boolean) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUGCId(ugcId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/" + ugcId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetTimelineList(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/timelinecontent/pageable/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetTimelineListPageInfo(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/timelinecontent/admin/pageable/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetTimelineListPageInfoSize(withToken: boolean, pageNo: number, size) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/timelinecontent/admin/pageable/" + pageNo + "?size=" + size, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUGCByPageNo(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/list/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUGCByPageSize(pageNo: number, size: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/admin/list/" + pageNo+"?size="+size, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Get UGC By Most Like in UGC Page Tab 2*/
  GetMostLikedUGCByPageNo(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/most/like/list/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Get UGC By creation date in UGC Page Tab 3*/
  GetUpToDateUGCByPageNo(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/create/date/list/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetFavoriteUgcListPagination(withToken: boolean, pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/ugc/liked/pageable/"+ pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }


  GetFavoriteUgcList() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/ugc/liked", reqOption).map(res => res.json()).catch(this.handleError);
      ;
    }
  }

  /*Get UGC Bu User Id*/
  GetUgcByIdUserAndPage(userId: number,pageNo:number) {
    console.log("This page no"+ pageNo)
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/user/" + userId+"/pageable/"+pageNo, reqOption).map(res => res.json()).catch(this.handleError);

    }
  }

  /*Get UGC Bu User Id and Page Number*/
  GetUgcByIdUser(userId: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/user/" + userId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Get UGC By ID*/
  GetUGCById(id: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/ugc/" + id, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  SearchUserObject(searchTerm:string,pageNo:number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/search-users?term="+searchTerm+"&pageNo="+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  SearchUGCObject(searchTerm:string,pageNo:number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/search-ugcs?term="+searchTerm+"&pageNo="+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  SearchArticleObject(searchTerm:string,pageNo:number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/search-articles?term="+searchTerm+"&pageNo="+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  SearchProductObject(searchTerm:string,pageNo:number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: new Headers()});
      return this.http.get(HttpService.baseUrl + "/search-products?term="+searchTerm+"&pageNo="+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Get Banner For the Timeline Page*/
  GetBanner() {
    let header: Headers = new Headers();
    let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
    return this.http.get(HttpService.baseUrl + "/banner/", reqOption).map(res => res.json()).catch(this.handleError);
  }
  GetUGCBanner() {
    let header: Headers = new Headers();
    let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
    return this.http.get(HttpService.baseUrl + "/banner/ugc", reqOption).map(res => res.json()).catch(this.handleError);
  }

  /*Get Product Cat For the Timeline Page*/
  GetProductCat() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/products", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Get GetParentCat For the Timeline Page*/
  GetParentCat() {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/parent_category", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductsByCatPageable(catId:any,pageNo:number) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/products/category/"+catId+"/pageable/"+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetProductsByCatSortedPageable(catId:any,pageNo:number,sortbyValue,direction) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      if(sortbyValue == "" && direction == ""){
        return this.http.get(HttpService.baseUrl + "/products/category/"+catId+"/pageable/"+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
      }else{
        return this.http.get(HttpService.baseUrl + "/products/category/"+catId+"/pageable/"+pageNo+"?by="+sortbyValue+"&dir="+direction, reqOption).map(res => res.json()).catch(this.handleError);
      }
    }
  }

  GetSubCat() {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/sub_category", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*GetProducts pageable*/
  GetProductsPageable(withToken: boolean, pageNo) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(withToken)
      });
      return this.http.get(HttpService.baseUrl + "/products/pageable/"+pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*GetProducts pageable*/
  GetFeatureProducts() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/products/featured/", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*GetProducts for the Timeline Page*/
  GetProducts() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/products", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductByID(id: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/products/single?id=" + id, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Products Liked By User*/
  GetProductsLikeByUser(userId: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + userId + "/products/liked", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*GetBadges for the BadgeDetail.ts Page*/
  GetBadgesList(pageNo: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/badge/pageable/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetBadgesByProductid(id: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/badge/product/" + id, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetBadgesSummerisedListByPagination(pageNo: number,type) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(type == ""){
        return this.http.get(HttpService.baseUrl + "/badge/summarized/pageable/" + pageNo, reqOption).map(res => res.json()).catch(this.handleError);
      }else{
        return this.http.get(HttpService.baseUrl + "/badge/summarized/pageable/" + pageNo+"?types="+type, reqOption).map(res => res.json()).catch(this.handleError);
      }
    }
  }

  GetBadgeById(id: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/badge/" + id, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllBagdeListByUserId(isAuthUser: boolean) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      if (isAuthUser) {
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/badges", reqOption).map(res => res.json()).catch(this.handleError);
      } else {
        return this.http.get(HttpService.baseUrl + "/users/" + "" + "/badges", reqOption).map(res => res.json()).catch(this.handleError);
      }
    }
  }
  GetAllChallengesByBadgeId(badgeId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/badge/"+ badgeId +"/challenges/", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllCampaignBagde(campaignId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/campaign/"+ campaignId +"/badges", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllCampaignBagdeByUserId(campaignId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/campaign/"+ campaignId +"/badges/?userId="+localStorage.getItem("UserData.userId"), reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAnsweredChallengeByBadgeId(badgeId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/badge/" + badgeId + "/badge-answer/?user="+localStorage.getItem("UserData.userId"), reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllBagdeListByOtherUserId(userId: number) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/users/" + userId + "/badges", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetBadgeListByType(type: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/badge/badge-type/" + type, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  /*Getting User Images and Account Data*/
  GetUserImages() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/images", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUserAccountInfo() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/account", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUserRestrictionStatus() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/security/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUserFollowers() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/follower", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUserFollowersWithPassingId(id) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + id + "/follower", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUserFollowings(userId?) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(!userId) userId = localStorage.getItem("UserData.userId");
      return this.http.get(HttpService.baseUrl + "/users/" + userId + "/following", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUserFollowingFollowerCounts(userId?) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(!userId) userId = localStorage.getItem("UserData.userId");
      return this.http.get(HttpService.baseUrl + "/users/" + userId + "/follower-following", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUserFollowingsWithPassingId(id) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + id + "/following", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  // PUT {{IP}}/campaign/{campaignId}/terms-conditions/{userId}
  acceptTnc(campaignId: string) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + "/campaign/" + campaignId + "/terms-conditions/"+localStorage.getItem("UserData.userId"),
          new RequestOptions({headers: this.getDefaultHeader(true)}))
    }
  }
  /*Like UGC*/
  addLike(id: string, type: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + type + "/" + id + "/like", JSON.stringify(''),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  /*Dislike UGC */
  removeLike(id: string, type: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + type + "/" + id + "/remove-like", JSON.stringify(''),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  addFavoriteUgc(id: string, type: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + type + "/" + id + "/favourite", JSON.stringify(''),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  removeFavoriteUgc(id: string, type: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .put(HttpService.baseUrl + type + "/" + id + "/remove-favourite", JSON.stringify(''),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  /*Follow User*/
  followUser(myId: string, userId: string, type: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .post(HttpService.baseUrl + type + "/" + myId + "/follow/" + userId, JSON.stringify(''),
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  unfollowUser(myId: string, userId: string, type: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.http
        .delete(HttpService.baseUrl + type + "/" + myId + "/unfollow/" + userId,
          new RequestOptions({headers: this.getDefaultHeader(withToken)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  public handleError = (error: Response) => {
    console.log(error);
    return Observable.throw(error)
  }

  /*Checking the Internet Connection*/
  isOnline(): boolean {
    if (navigator['connection'].type == "none") {
      this.alertForNoInternet();
      return false;
    } else {
      return true;
    }
  }

  /*Alert Pop Up for No Internet*/
  alertForNoInternet() {
    // console.log("*****");
    // let alert = this.alertCtrl.create({
    //   title: 'Opps!',
    //   message: 'No Internet Connection',
    //   buttons: [
    //     {
    //       text: 'Okay',
    //       handler: () => {
    //         this.platform.exitApp();
    //       }
    //     }
    //   ]
    // });
    // alert.present();
  }

  /*Get UGC comment List By UGC ID*/
  GetUgcCommentsById(ugcId: string) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/" + ugcId + "/comments", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUgcCommentsByIdPageNo(ugcId: string, page: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/" + ugcId + "/comments/" + page, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetUGCReportReasons() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc-report-reasons", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetReviewReportReasons() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/product-review-report-reasons", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductPartnerList() {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/productpartner", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductPartnerByProductId(id:any) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/productpartner/product/"+id, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductsByBadgeidPageable(id:any, pageNo:number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/products/badge/" + id +"/pageable/"+ pageNo, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetPartnerList() {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/partner", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  ReportUGC(reason: string, reasonId: number, ugcId: number) {
    if (this.isOnline()) {
      return this.post("/ugc-report", {
        "reason": reason,
        "reasonId": reasonId,
        "ugcId": ugcId,
        "userId": localStorage.getItem("UserData.userId"),
      }, true);
    }
  }


  ReportReview(reason: string, reasonId: number, productReviewId: number) {
    if (this.isOnline()) {
      return this.post("/product-review-report", {
        "reason": reason,
        "reasonId": reasonId,
        "productReviewId": productReviewId,
        "userId": localStorage.getItem("UserData.userId"),
      }, true);
    }
  }

  /*Give Comment on UGC from Write Comment Foot Section*/
  addUGCComment(comment: string, ugcId: number) {
    if (this.isOnline()) {
      return this.post("/ugc-comment", {
        "comment": comment,
        "ugcId": ugcId,
        "userId": GlobalVariable.userId,
      }, true);
    }
  }

  /*Verify User Send CODE to Device By sending SMS from BACKEND*/
  verifyUser(phoneNumber: string, withToken: boolean = true) {
    if (this.isOnline()) {
      return this.post("/users/verify/forget", {
        "phoneNumber": phoneNumber,
      }, false);
    }
  }

  /*ForgotUserPassword from the SIGN-Up Screen*/
  forgotUserPassword(phoneNumber: string, newPasswod: string, code: string) {
    if (this.isOnline()) {
      return this.post("/users/forgetPassword", {
        "phoneNumber": phoneNumber,
        "password": newPasswod,
        "code": code
      }, false);
    }
  }

  /* Profile Survay Section APIs*/
  GetNextQuestionData() {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/profile-question/next-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllProfileQuestion() {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/profile-question").map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductQuestionsByUserId(userId: number) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/question/user/" + userId).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllAnswerByUser() {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/profile-answer").map(res => res.json()).catch(this.handleError);
    }
  }

  GetProductAnswersByUserId(userId: number) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/answer/user/" + userId).map(res => res.json()).catch(this.handleError);
    }
  }

  GiveProfileSurveyAnswer(questionId: number, selectedOptionIds: number[], answer: string, skipped: boolean) {
    if (this.isOnline()) {
      return this.post("/profile-answer", {
        "questionId": questionId,
        "selectedOptionIds": selectedOptionIds,
        "answer": answer,
        "skipped": skipped,
        "userId": localStorage.getItem("UserData.userId")
      }, true);
    }
  }
  GiveProfileSurveyIntensityAnswer(questionId: number, key: number, value: number) {
    if (this.isOnline()) {
      return this.post("/intensity-answer", {
        "questionId": questionId,
        "subjectId": value,
        "intensityId": key
      }, true);
    }
  }
  GiveProfileSurveyIntensityAnswerNew(questionId: number, jsonArray:any, skipped: boolean) {
    if (this.isOnline()) {
      return this.post("/intensity-answer-bundle", {
        "questionId": questionId,
        "intensityAnswers": jsonArray,
        "skipped": skipped,
        "userId": localStorage.getItem("UserData.userId")
      }, true);
    }
  }
  GetPendingCampaignCount() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/tasks/pending/" + localStorage.getItem("UserData.userId"), reqOption)
        .map(res => res.json())
        .catch(this.handleError);
    }
  }
  /* Campaign Section APIs*/
  GetCampaignListByUserId() {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/campaign?userId=" + localStorage.getItem("UserData.userId"), reqOption)
        .map(res => res.json())
        .catch(this.handleError);
    }
  }
  GetCampaignListByUserIdByPage(pageNo,size) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/campaign-detail/page/" + pageNo + "?userId=" + localStorage.getItem("UserData.userId") + "&size=" + size + "&dir=ASC", reqOption)
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  GetCampaignById(campId: number) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/campaign/" + campId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  
  //http://106.14.164.125:8083/api/v1/campaign/83?userId={{userId}}
  GetCampaignByUserId(campId: number) {
    if (this.isOnline()) {
      let header: Headers = new Headers();
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: header});
      return this.http.get(HttpService.baseUrl + "/campaign/" + campId+"?userId="+localStorage.getItem("UserData.userId"), reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetQTCCampaignStatusByCmpId(campId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/quick-try/" + campId + "/status", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetAvailableQTCCampaignByCmpId(campId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/quick-try/" + campId, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetAvailableQTCCampaignByUserId(pgno) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/quick-try/user/"+localStorage.getItem("UserData.userId")+'/available/page/'+pgno+'?size=10&dir=ASC', reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetAppliedQTCCampaignByUserId(pgno) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({method: RequestMethod.Get, headers: this.getDefaultHeader(true)});
      return this.http.get(HttpService.baseUrl + "/quick-try/user/"+localStorage.getItem("UserData.userId")+'/applied/page/'+pgno+'?size=10&dir=DESC', reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  /*Message Section APIs*/
  GetUserMessagesList(type: string) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message?category=" + type, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUserAggregateMessagesList(category: string, status) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message-count?category="+category+"&status="+status, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUserAggregateMessagesCount(category: string, status) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message-count?category="+category+"&status="+status, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetUserMessage(category: string, size,pageno) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(category == "none"){
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message/"+pageno+"?size="+size, reqOption).map(res => res.json()).catch(this.handleError);
      }
      else{
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message/"+pageno+"?size="+size+"?category=" + category, reqOption).map(res => res.json()).catch(this.handleError);
      }
    }
  }
  GetUnreadMessageCount(category) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(category != ""){
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/new-message-count?category="+category, reqOption).map(res => res.json());
      }else{
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/new-message-count", reqOption).map(res => res.json());
      }
    }
  }
  GetNewMessageCount(category,status) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(category != ""){
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message?category="+category+"&status="+status, reqOption).map(res => res.json());
      }else{
        return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/message?status="+status, reqOption).map(res => res.json());
      }
    }
  }
  DeleteMessageById(id: string) {
    if (this.isOnline()) {
      return this.http
        .delete(HttpService.baseUrl + "/message/" + id, new RequestOptions({headers: this.getDefaultHeader(true)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }
  GetPreSurveyQuestion(campId: number) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/campaign/" + campId + "/pre-survey-question", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetPreSurveyAnswerByUserId(campId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/user/"+localStorage.getItem("UserData.userId")+"/campaign/" + campId + "/pre-survey", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetNextSurveyQuestion(campId: number, type, badgeId){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(type == 'pre-survey'){
        return this.http.get(HttpService.baseUrl + "/campaign/" + campId + "/next-pre-survey-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
      } else if(type == 'quick-try-free'){
        return this.http.get(HttpService.baseUrl + "/quick-try/" + campId + "/next-survey-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
      } else if(type == 'post-survey'){
        return this.http.get(HttpService.baseUrl + "/campaign/" + campId + "/badge/" + badgeId + "/next-post-survey-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
      }
    }
  }
  GetNextPresurveyQuestion(campId: number,type) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if(type == 'pre-survey'){
        return this.http.get(HttpService.baseUrl + "/campaign/" + campId + "/next-pre-survey-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
      } else if(type == 'quick-try-free'){
        return this.http.get(HttpService.baseUrl + "/quick-try/" + campId + "/next-survey-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
      }
    }
  }
  GetPostsurveyQuestionsByBadgeId(campId: number,badgeId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/campaign/" + campId + "/post-survey-question?badgeId" + badgeId, reqOption).map(res => res.json());
    }
  }
  GetNextPostsurveyQuestion(campId: number,badgeId) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/campaign/" + campId + "/badge/" + badgeId + "/next-post-survey-question/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
    }
  }

  GetUnreadBoxTrackCount() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/new-message-count?category=box_tracking", reqOption).map(res => res.json());
    }
  }

  GetUnreadOtherCount() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/" + localStorage.getItem("UserData.userId") + "/new-message-count?category=other", reqOption).map(res => res.json());
    }
  }

  ChangeMessageStatus(type: string, status: string, messageId: number) {
    if (this.isOnline()) {
      return this.http.put(HttpService.baseUrl + "/message/" + messageId + "/status?status=" + status, JSON.stringify(''),
        new RequestOptions({headers: this.getDefaultHeader(true)}))
        .map(res => res.json())
        .catch(this.handleError);
    }
  }

  /* Pre Survey Answers Section */
  AddPreSurveyMemberDetail(formData: any, campId: number,type) {
    if (this.isOnline()) {
      if(type == "quick-try-free"){
        console.log(type);
        return this.post("/quick-try/" + campId + "/complete-pre-application", formData, true);
      }else{
        console.log(type);
        return this.post("/campaign/" + campId + "/pre-survey-member-detail", formData, true);        
      }
    }
  }

  AddPreSurveyAnswer(campId: number, userAnswers: any, type) {
    var answerObj = userAnswers;
    if (this.isOnline()) {
      if (type == 'quick-try-free') {
        return this.post("/quick-try/" + campId + "/quick-try-answer", answerObj, true);
      } else if(type == 'pre-survey'){
        return this.post("/campaign/" + campId + "/pre-survey-answer", answerObj, true);
      } else if(type == 'post-survey'){
        return this.post("/campaign/" + campId + "/post-survey-answer", answerObj, true);
      }
    }
  }

  /*Challanges Answers APIs*/
  AddSubmitLinkChallange(link: string, badgeId: number, challengeId: number) {
    if (this.isOnline()) {
      return this.post("/badge/badge-answer", {
        "link": link,
        "badgeId": badgeId,
        "challengeId": challengeId,
        "userId": parseInt(localStorage.getItem("UserData.userId"))
      }, true);
    }
  }
  AddSubmitAnswerChallange(answer: string, badgeId: number, challengeId: number) {
    if (this.isOnline()) {
      return this.post("/badge/badge-answer", {
        "answer": answer,
        "badgeId": badgeId,
        "challengeId": challengeId,
        "userId": parseInt(localStorage.getItem("UserData.userId"))
      }, true);
    }
  }

  /*User interest*/
  AddUserInterest(categoriesId: any) {
    if (this.isOnline()) {
      return this.post("/user-interest", {
        "userId": parseInt(localStorage.getItem("UserData.userId")),
        "badgesId": categoriesId
      }, true);
    }
  }

  /*Social Media*/
  GetUserDataFromWeibo_(access_token: any, userId: any): Observable<any> {
    console.log("IsOnline: ", this.isOnline());
    if (this.isOnline()) {
      let weiboUrl = `https://api.weibo.com/2/users/show.json?access_token=${access_token}&uid=${userId}`;
      return this.http.get(weiboUrl).map(res => res.json());
    } else {
      return Observable.throw("Status is offLine");
    }
  }

  GetUserDataFromWeibo(access_token: any, userId: any): Observable<any> {
    console.log("IsOnline: ", this.isOnline());
    if (this.isOnline()) {
      let weiboUrl = HttpService.baseUrl + "/weibo/show.json?access_token=" + access_token + "&uid=" + userId;
      return this.http.get(weiboUrl).map(res => res.json());
    } else {
      return Observable.throw("Status is offLine");
    }
  }
  AddWeiboUserData(data: any) {
    if (this.isOnline()) {
      return this.post("/weibo/login", data, false);
    }
  }

  AddWechatUserData(data: any) {
    if (this.isOnline()) {
      return this.post("/wechat/login", data, false);
    }
  }
  GetWeChatAccessToken(code: any) {
    if (this.isOnline()) {
      let url = HttpService.baseUrl +"/wechat/sns/oauth2/access_token?code=" + code + "&grant_type=authorization_code";
      return this.http.get(url).map(res => res.json());
    }
  }

  GetWeChatUserData(access_token: any, openid: any) {
    if (this.isOnline()) {
      let url = HttpService.baseUrl +"/wechat/sns/userinfo?access_token=" + access_token + "&openid=" + openid;
      return this.http.get(url).map(res => res.json());
    }
  }
  phoneCheck(phoneNumber: any) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/users/phoneCheck/" + phoneNumber).map(res => res.json());
    }
  }

  CheckWechatUserExists(wechatUniqueId: any) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/wechat/check/" + wechatUniqueId).map(res => res.json());
    }
  }

  CheckWeiboUserExists(weiboUniqueId: any) {
    if (this.isOnline()) {
      console.log("Going to check /weibo/check/" + weiboUniqueId);
      return this.http.get(HttpService.baseUrl + "/weibo/check/" + weiboUniqueId).map(res => res.json());
    }
  }

  CheckWeiboUserExistsForUserId(weiboUniqueId: any, userId: any) {
    if (this.isOnline()) {
      console.log("Going to check /weibo/check/" + weiboUniqueId);
      return this.http.get(HttpService.baseUrl + "/weibo/check/" + weiboUniqueId + "/" + userId)
        .map(res => res.json());
    }
  }

  CheckWeiboUserAvailabilityForUserId(weiboUniqueId: any, userId: any) {
    if (this.isOnline()) {
      console.log("Going to check /weibo/check/" + weiboUniqueId);
      return this.http.get(HttpService.baseUrl + "/weibo/check/" + weiboUniqueId + "/available/" + userId)
        .map(res => res.json());
    }
  }

  getProhibitedWordsList() {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/prohibited-word").map(res => res.json());
    }
  }

  GetSnsServiceList() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/snsService", reqOption).map(res => res.json());
    }
  }

  GetSocialImpactByUserId() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/socialimpact/user/" + localStorage.getItem("UserData.userId"), reqOption).map(res => res.json());
    }
  }


  GetReferralInfoForUser(userId: any) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/socialimpact/user/" + userId + "/impactScore", reqOption).map(res => res.json());
    }
  }
  
  SetWeiboCountByUserId() {
    return new Promise<any>((resolve, reject) => {
      try {
        this.GetSocialImpactByUserId().subscribe((resp) => {
          console.log("*resp: ", resp);
          const count: any = localStorage.getItem('weibo_followers_count');
          let bodyPayload = {
            followerCount: Number(count),
            snsStatus: "APPROVED",
            snsToken: localStorage.getItem('access_token'),
            snsServiceId: 1
          };

          if (resp.length > 0) {
            const data = resp.find(item => item.snsServiceId === 1);
            if (data) { //We should update the Weibo Social Impact
              this.UpdateUserWeiboSocial(localStorage.getItem("weibo_user_id")).then(res => {
                console.log("About to call UpdateSocialImpact@httpService.SetWeiboCountByUserId");
                this.UpdateSocialImpact(data.id, bodyPayload).then(res => resolve("true"));
              });
            } else {
              const userid = localStorage.getItem('UserData.userId');
              bodyPayload['userId'] = Number(userid);
              bodyPayload['snsServiceId'] = 1;
              this.CreateSocialImpact(bodyPayload).then(() => {
                resolve("true");
              });
            }
          } else {
            const userid = localStorage.getItem('UserData.userId');
            bodyPayload['userId'] = Number(userid);
            bodyPayload['snsServiceId'] = 1;
            this.CreateSocialImpact(bodyPayload).then(() => {
              resolve("true");
            });
          }
        })
      } catch (error) {
        resolve("true")
        console.error("*Error: ", error)
      }
    })
  }


  UpdateSocialImpact(id, bodyPayload): Promise<any> {
    const reqOption: RequestOptionsArgs = {
      method: RequestMethod.Put,
      headers: this.getDefaultHeader(true)
    };
    return new Promise<any>((resolve, reject) => {
      this.http.put(`${HttpService.baseUrl}/socialimpact/${id}`, bodyPayload, reqOption)
      //.retry(5)
      .subscribe(res => {
        console.log("**Update social impact Success res : ", res);
        resolve(true);
      }, error => {
        reject(false);
      });
    })
  }

  CreateSocialImpactWeibo(payload) {
    const reqOption: RequestOptionsArgs = {
      method: RequestMethod.Post,
      headers: this.getDefaultHeader(true)
    };
    return this.http.post(`${HttpService.baseUrl}/socialimpact-create`, payload, reqOption).toPromise();
  }

  CreateSocialImpact(payload) {
    return new Promise<any>((resolve, reject) => {
      console.log("PayLoad : ", payload);
      const url = "http://47.100.253.183:4200/assets/logo.png";
      const fileTransfer1: FileTransferObject = this.transfer.create();
      var tempDirectory = this.platform.is("ios")? this.file.tempDirectory : this.file.externalDataDirectory;
      fileTransfer1.download(url, tempDirectory + 'file.jpg').then((entry) => {
        console.log('download complete: ' + entry.toURL());
        var filePath = entry.toURL();
        const fileTransfer: FileTransferObject = this.transfer.create();
        console.log("Image for social impact has been resized");
        var headers11 = {"Authorization": "Bearer " + GlobalVariable.token};
        let options: FileUploadOptions = {
          fileKey: 'socialImpactImage',
          fileName: GlobalVariable.uploadImgName,
          chunkedMode: false,
          mimeType: "image/jpeg",
          httpMethod: "post",
          params: payload
        };

        options.headers = headers11;
        console.log("**File Path : ", filePath);
        fileTransfer.upload(filePath, HttpService.baseUrl + "/socialimpact", options).then((data) => {
            console.log("*Success : ", data);
            resolve(true);
        }, (err) => {
          console.error("*Error : ", err);
          reject(false);
        });
      }, (error) => {
        console.error("*Failed to Download : ", error);
        reject(false);
      });
    });
  }

  UpdateUserWeiboSocial(data = null): Promise<any> {
    const body = {"weiboSocialUniqueId": data};
    const reqOption: RequestOptionsArgs = {
      method: RequestMethod.Put,
      headers: this.getDefaultHeader(true)
    };
    return this.http.put(HttpService.baseUrl + "/users", body, reqOption)
      .map(res => {
        localStorage.setItem("weibo_user_id", data);
        return res.json();
      })
      .toPromise();
  }

  GetAllElementsWithPagination(pageNo: number){
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/search-objects/pageable/" + pageNo, reqOption)
      .map(res => res.json())
      .catch(this.handleError);
  }
  GetAllTimelineList() {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/timelinecontent", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetTimelineById(id: any) {
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/timelinecontent/"+id, reqOption).map(res => res.json()).catch(this.handleError);
    }
  }

  GetAllSearchableElementsByPage(pageNo:number){
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/search-objects/pageable/"+pageNo, reqOption)
      .map(res => res.json())
      .catch(this.handleError);
  }

  GetAllSearchableElements(){
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/search-objects", reqOption)
      .map(res => res.json())
      .catch(this.handleError);
  }
  GetAllSearchableElementsCount(term){
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/count-objects-by-term?term="+encodeURIComponent(term), reqOption)
      .map(res => res.json())
      .catch(this.handleError);
  }
  GetAllSearchableElementsPaged(term, size, category, pageNo){
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    if(category != ''){
      return this.http.get(HttpService.baseUrl + "/search-objects-by-term/pageable/"+pageNo+"?term="+encodeURIComponent(term)+"&pageSize="+size+"&category="+category, reqOption)
      .map(res => res.json())
      .catch(this.handleError);
    } else{
      return this.http.get(HttpService.baseUrl + "/search-objects-by-term/pageable/"+pageNo+"?term="+encodeURIComponent(term)+"&pageSize="+size, reqOption)
      .map(res => res.json())
      .catch(this.handleError);
    }
    
  }
  GetCurrentVersion() {
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(false)
    });
    return this.http.get(HttpService.baseUrl + "/versions_all", reqOption)
      .map(res => {
        return this.initializeNetworkEvents(res.json());
      })
      .catch(this.initializeNetworkEvents(this.handleError));
  }
  public initializeNetworkEvents(res) {
    let element = document.querySelector(".no-connection");
    let networktype = this.getNetworkType();
    let networkStatus = this.getNetworkStatus();
    if(networktype == "none"){
      element.classList.add('show-message');
      element.classList.remove('hide-message');
    }
    else{
      element.classList.add('hide-message');
      element.classList.remove('show-message');
    }
    /* OFFLINE */
    this.network.onDisconnect().subscribe(() => {
        if (this.status === ConnectionStatus.Online) {
            this.setStatus(ConnectionStatus.Offline);
            element.classList.add('show-message');
            element.classList.remove('hide-message');
        }
    })

    /* ONLINE */
    this.network.onConnect().subscribe(() => {
        if (this.status === ConnectionStatus.Offline) {
            this.setStatus(ConnectionStatus.Online);
            element.classList.add('hide-message');
            element.classList.remove('show-message');
        }
    })
    return res;
}

public getNetworkType(): string {
    return this.network.type
}

public getNetworkStatus(): Observable<ConnectionStatus> {
    return this._status.asObservable();
}

private setStatus(status: ConnectionStatus) {
    this.status = status;
    this._status.next(this.status);
}

/*Get Related Ugc by tags*/
GetUGCRelatedByTag(ugcId: number, pageNo) {
  if (this.isOnline()) {
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/ugc/" + ugcId+"/related/"+pageNo , reqOption).map(res => res.json()).catch(this.handleError);
  }
}
GetAutoUGCRelatedByTag(ugcId: number, pageNo) {
  if (this.isOnline()) {
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/ugc/" + ugcId+"/related/pageable/"+pageNo+"?size=7" , reqOption).map(res => res.json()).catch(this.handleError);
  }
}
  GetPublicCountDetail(userId:any){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/public-account/" + userId , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetMostLikefeaturedUgcByUserId(userId:any,pageNo){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/ugc/most/like/featured/"+userId+"/list/"+ pageNo , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetEditorScore(userId){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/score/"+userId , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetEditorScore_1_Pageable(userId,pageNo,size){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      // return this.http.get(HttpService.baseUrl + "/score/"+userId+"/list/"+pageNo , reqOption).map(res => res.json()).catch(this.handleError);
      return this.http.get(HttpService.baseUrl + "/score/"+userId+"/product-review/"+pageNo+"?size="+size , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetEditorScore_2_Pageable(userId,pageNo,size){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/score/"+userId+"/ugc/"+pageNo+"?size="+size , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetFollowingContentUGC(userId,pageNo,size){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/"+userId+"/following/content/ugc/"+pageNo+"?size="+size , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetFollowingContentReview(userId,pageNo,size){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/users/"+userId+"/following/content/product-review/"+pageNo+"?size="+size , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  phoneVerificationCheck(phoneNumber: any) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/users/phoneVerificationStatus/" + phoneNumber).map(res => res.json());
    }
  }
  accountStatus(phoneNumber: any) {
    if (this.isOnline()) {
      return this.http.get(HttpService.baseUrl + "/users/accountStatus/" + phoneNumber).map(res => res.json());
    }
  }
  shareContentAPI(id,type){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + type + id + "/share" , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  getProvinces(id){
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    if (id == '') {
      return this.http.get(HttpService.baseUrl + "/location/province" , reqOption).map(res => res.json()).catch(this.handleError);
    }else{
      return this.http.get(HttpService.baseUrl + "/location/province" , reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  

  registerDeviceToken(token: String){
      return this.http
        .post(HttpService.baseUrl + "/notifications/registerDevice",{deviceToken: token},
          new RequestOptions({headers: this.getDefaultHeader(true)}))
        .map(res => res.json())
        .catch(error => Observable.of(error.json()));

  }

 unregisterDeviceToken(){
    return this.http
      .post(HttpService.baseUrl + "/notifications/unRegisterDevice",{},
        new RequestOptions({headers: this.getDefaultHeader(true)}))
      .map(res => res.json())
      .catch(error => Observable.of(error.json()));

}
GetBalanceCoins(){
  if (this.isOnline()) {
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    return this.http.get(HttpService.baseUrl + "/gift-market/balance/"+localStorage.getItem("UserData.userId"), reqOption).map(res => res.json()).catch(this.handleError);
  }
}
GetGiftMarketProducts(pgno,status,stock){
  if (this.isOnline()) {
    let reqOption: RequestOptions = new RequestOptions({
      method: RequestMethod.Get,
      headers: this.getDefaultHeader(true)
    });
    if(status == "" && stock != "in-stock"){
      return this.http.get(HttpService.baseUrl + "/gift-market/product/pageable/"+pgno+"?size=10" , reqOption).map(res => res.json()).catch(this.handleError);
    }else{
      if(stock == "in-stock"){
        return this.http.get(HttpService.baseUrl + "/gift-market/product/in-stock/pageable/"+pgno+"?size=10" , reqOption).map(res => res.json()).catch(this.handleError);
      }else{
        return this.http.get(HttpService.baseUrl + "/gift-market/product/pageable/"+pgno+"?size=10&status="+status , reqOption).map(res => res.json()).catch(this.handleError);
      }
    }
  }
}
  ClaimGiftMarketProduct(data) {
    return this.http
      .post(HttpService.baseUrl + "/gift-market/product/claim",data,
        new RequestOptions({headers: this.getDefaultHeader(true)}))
      .map(res => res.json())
      .catch(error => Observable.of(error.json()));
  }
  GetQTCWinners(cmpId,pageNo){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      return this.http.get(HttpService.baseUrl + "/quick-try/"+cmpId+"/winners/"+pageNo+"?size=5", reqOption).map(res => res.json()).catch(this.handleError);
    }
  }
  GetIntroStatement(cmpId, type){
    if (this.isOnline()) {
      let reqOption: RequestOptions = new RequestOptions({
        method: RequestMethod.Get,
        headers: this.getDefaultHeader(true)
      });
      if (type == 'pre-survey'|| type == 'quick-try-free') {
        return this.http.get(HttpService.baseUrl + "/campaign/"+cmpId+"/surveyOptions?surveyCategory=PRE_SURVEY", reqOption).map(res => res.json()).catch(this.handleError);
      }
    }
  }
  AddIntroStatementSataus(cmpId, type){
    if (this.isOnline()) {
      if (type == 'pre-survey' || type == 'quick-try-free') {
        return this.post("/campaign/" + cmpId + "/readSurveyIntro?surveyCategory=PRE_SURVEY", {readStatus: true, userId: localStorage.getItem("UserData.userId")}, true);   
      }
    }
  }
}