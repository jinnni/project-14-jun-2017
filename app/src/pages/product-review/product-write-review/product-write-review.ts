import {Component, ChangeDetectorRef} from '@angular/core';
import {NavController,  NavParams,  ToastController,  AlertController,  ActionSheetController, Platform} from 'ionic-angular';
import {DomSanitizer} from "@angular/platform-browser";
import {Camera} from '@ionic-native/camera';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {File} from '@ionic-native/file';
import {GlobalVariable} from "../../../global/global.variable";
import {Headers, Http, RequestOptions} from "@angular/http";
import {Util} from "../../../global/util";
import {HttpService} from "../../../services/httpService";
import {Crop} from '@ionic-native/crop';
import { SettingsProvider } from '../../../providers/settingsProvider';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { CampaignBadgeDetailPage } from '../../../pages/campaign-badge-detail/campaign-badge-detail';

declare let MediaPicker;

@Component({
  selector: 'page-product-write-review',
  templateUrl: 'product-write-review.html'
})
export class ProductWriteReviewPage {
  rating: any;
  content: string;
  productId: any;
  productData: any;
  productName: string;
  userData: any;
  imageURI: any;
  badgeId: any;
  challengeId: any;
  from: string;
  counter: boolean = true;
  leftCharacters: number = 0;
  characterLength: number = 70;
  prohibitedWords: any = [];
  edit: boolean = false;
  public images: any = [];
  protected uploadFinished = false;
  public isUploading = false;
  public uploadingProgress = {};
  public uploadingHandler = {};
  maxPictureCount = 9;
  imageUrl: any;
  photos: any = [];private win: any = window;
  reviewId: any;
  isFocus:false;
  setBoolean_ = false;
  perc = 0;
  count = 0;
  length = 0;
  constructor(public navCtrl: NavController,
              private httpService: HttpService,
              private transfer: FileTransfer,
              private file: File,
              public  http: Http,
              public platform: Platform,
              public sanitization: DomSanitizer,
              private actionSheetCtrl: ActionSheetController,
              private camera: Camera,
              public cropService: Crop,
              private cdRef: ChangeDetectorRef,
              private toastCtrl: ToastController,
              private alertCtrl: AlertController,private webview: WebView,
              private settingsProvider:SettingsProvider,
              public navParams: NavParams) {
    this.productId = navParams.get('productId');
    this.productName = navParams.get('productName');
    this.from = navParams.get('from');
    this.badgeId = navParams.get('badgeId');
    this.challengeId = navParams.get('challengeId');
    this.content = navParams.get('reviewContent');
    this.rating = navParams.get('rating');
    this.images = navParams.get('images');
    this.reviewId = navParams.get('reviewId');
    this.userData = JSON.parse(localStorage.getItem("UserData"));
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.setBoolean_ = false;
    if (typeof this.content === 'undefined') this.content = '';
    this.characterLength = this.content.length;
    if (this.content.length >= 70) {
      this.counter = false;
    } else {
      this.leftCharacters = 0 + this.content.length;
      this.counter = true;
    }
    if (typeof this.images === 'undefined') this.images = [];
    else {
      var i: number = 0;
      this.edit = true;
      for (let image of this.images) {
        this.images[i] = this.imageUrl + image;
        i++;
      }
    }
    this.GetProhibitedWordsList();
  }
  change(value) {
    let trimValue = value.replace(/\s/g,'');
    this.characterLength = trimValue.length;
    if (trimValue.length >= 70) {
      this.counter = false;
    } else {
      this.leftCharacters = 0 + trimValue.length;
      this.counter = true;
    }
  }

  GetProhibitedWordsList() {
    this.httpService.getProhibitedWordsList().subscribe(res => {
      this.prohibitedWords = res;
    });
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: '选择图片或拍照',
      buttons: [
        {
          text: '拍照',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: '相册',
          handler: () => {
            this.openImagePicker();
          }
        }
      ]
    });
    actionSheet.present();
  }

  takePicture() {
    let options = {
      allowEdit: true
    };
    this.camera.getPicture(options)
      .then((data) => {
        this.images.push(data);
        this.cdRef.detectChanges();
      }, function (error) {console.log(error);});
  }

  openImagePicker() {
    var self = this;
    var args = {
      'selectMode': 100,
      'maxSelectCount': (9 - this.images.length),
      'maxSelectSize': 188743680,
    };
      MediaPicker.getMedias(args, (medias) => {
        self.compress(medias);
        self.cdRef.detectChanges();
      }, (e) => {})
  }

  compress(medias){
    var self = this;
    for (let i = 0; i < medias.length; i++) {
      medias[i].quality = '75';
      MediaPicker.compressImage(medias[i], function(compressData) {
        self.images.push(compressData.path);
        self.cdRef.detectChanges();
      }, function(e) {});
    }
  }

  removeItem(item) {
    let index: number = this.images.indexOf(item);
    if (index !== -1) {
      this.images.splice(index, 1);
    }
  }

  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
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
  ionViewWillEnter(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
  }
  postReviewProduct(event) {
    let currentIndex = this.navCtrl.getActive().index - 1;
    this.navCtrl.remove(currentIndex);
    if (this.content == null || this.content.length < 70) {
      Util.showSimpleToastOnTop("请添加不少于70字符 ", this.toastCtrl);
      return;
    }
    if (this.rating == null) {
      Util.showSimpleToastOnTop("给产品评分", this.toastCtrl);
      return;
    }
    if (this.images.length == 0) {
      Util.showSimpleToastOnTop("请选择图片", this.toastCtrl);
      return;
    }
    let flag = 0;
    for (let word of this.prohibitedWords) {
      if (this.content.search(word) != -1) {
        let alert = this.alertCtrl.create({
          title: '警告！',
          message: '此评价包含禁用词，请勿使用任何禁用词。',
          buttons: [
            {
              text: 'Okay',
              role: 'cancel'
            }
          ]
        });
        alert.present();
        flag = 1;
      }
    }
    if (flag == 0) {
      this.content = this.content.trimLeft();
      this.content = this.content.trimRight();
      var oHeaders = new Headers();
      oHeaders.set("Authorization", "Bearer " + GlobalVariable.token);
      let formData: FormData = new FormData();
      if (typeof this.reviewId !== 'undefined') formData.append('id', this.reviewId.toString());
      formData.append('content', this.content);
      formData.append('rating', this.rating);
      formData.append('userId', localStorage.getItem("UserData.userId"));
      formData.append('productId', this.productId);
      if (this.from) {
        formData.append('badgeId', this.badgeId);
        if (this.from == "challenge") {
          formData.append('challengeId', this.challengeId);
        }
      } else {
        formData.append('badgeId', '');
      }
      this.setBoolean_ = true;
      this.length = this.images.length;
      this.count = 0;
      this.cdRef.detectChanges();
      if (!this.edit) {
        this.http.post(HttpService.baseUrl + "/review", formData, new RequestOptions({headers: oHeaders}))
          .toPromise()
          .then((response) => {
            this.settingsProvider.currentPageRefresh = "product-review-list";
            this.toastCtrl.create({
              message: "正在发布中...",
              duration: 3000,
              position: 'top'
            }).present();
            this.postUploadReviewImages(response.json().id);
          });
      }
      else {
        var reviewContent: any = {
          'id': this.reviewId.toString(),
          'content': this.content,
          'rating': this.rating,
          'userId': localStorage.getItem("UserData.userId"),
          'productId': this.productId
        };
        if (this.from) {
          reviewContent = {
            'id': this.reviewId.toString(),
            'content': this.content,
            'rating': this.rating,
            'userId': localStorage.getItem("UserData.userId"),
            'productId': this.productId,
            'badgeId': this.badgeId
          };
          if (this.from == "challenge") {
            reviewContent = {
              'id': this.reviewId.toString(),
              'content': this.content,
              'rating': this.rating,
              'userId': localStorage.getItem("UserData.userId"),
              'productId': this.productId,
              'badgeId': this.badgeId,
              'challengeId': this.challengeId
            };
          }
        } else {
          reviewContent = {
            'id': this.reviewId.toString(),
            'content': this.content,
            'rating': this.rating,
            'userId': localStorage.getItem("UserData.userId"),
            'productId': this.productId,
            'badgeId': ''
          };
        }
        this.httpService.put("/review", reviewContent, true)
          .subscribe(response => {
            this.settingsProvider.currentPageRefresh = "product-review-list";
            /*Your review has been submitted*/
            this.presentToast('你已提交评价!');
          });
        this.navCtrl.pop();
      }
    }
  }

  downloadImages(reviewId: number) {
    var i: number = 0;
    var j: number = 0;
    var filename: any = [];
    var tempDirectory = this.platform.is("ios")? this.file.tempDirectory : this.file.externalDataDirectory;
    for (let image of this.images) {
      filename[j] = j.toString() + '.jpg';
      const fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.download(image, tempDirectory + filename[j]).then((entry) => {
        this.images[i] = tempDirectory + filename[i];
        i++;
        if (i == this.images.length) {
          this.postUploadReviewImages(reviewId);
        }
      }, (error) => {
        console.log(error);
      });
      j++;
    }
  }

  postUploadReviewImages(reviewId: number) {
    if(this.from == "challenge"){
      let currentIndex = this.navCtrl.getActive().index - 1;
      this.navCtrl.remove(currentIndex);
    }
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: 'image',
      fileName: GlobalVariable.uploadImgName,
      chunkedMode: false,
      httpMethod: "post",
      headers:{"Authorization": "Bearer " + GlobalVariable.token},
      params: {
        'productReviewId': reviewId,
      }
    };
    fileTransfer.onProgress((progressEvent) => {
      this.perc = 0;
      if (progressEvent.lengthComputable) {
        this.perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
      } else {
        this.perc = 1;
      }
    });
    this.images.reduce((promise:any, item:any) => {
      return promise.then((result) => {
        fileTransfer.upload(item, HttpService.baseUrl + "/product/review/image", options).then((data) => {
          this.count++;
          this.cdRef.detectChanges();
          if(this.count == this.length || this.length == 0){
            if(this.from == "challenge"){
              this.alertCtrl.create({
                title: "恭喜你~！已成功提交",
                message: "提交的任务，很快就会有审核结果的！",
                cssClass: 'okcancel',
                buttons: ["确定"]
              }).present();
              this.navCtrl.pop();
              this.navCtrl.push(CampaignBadgeDetailPage).then(()=>{
                let currentIndex = this.navCtrl.getActive().index - 1;
                this.navCtrl.remove(currentIndex);
              });
            }else{
              this.presentToast('你已提交评价!');
              this.navCtrl.pop();
            }
          }
        }, (err) => {
          this.presentToast('有地方出错，请重新试一下！');
        });
      });
    }, Promise.resolve())
  }
}
