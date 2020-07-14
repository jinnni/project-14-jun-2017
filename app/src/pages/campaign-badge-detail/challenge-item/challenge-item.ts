import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import {DomSanitizer} from "@angular/platform-browser";
import { HttpService } from "../../../services/httpService";
import { Subject } from "rxjs/Subject";
import { AlertController, NavController, ToastController, ActionSheetController, Platform } from "ionic-angular";
import {ProductDetailPage} from "../../product-detail/product-detail";
import {CampaignBadgeDetailPage} from "../../campaign-badge-detail/campaign-badge-detail";
import {UgcCreatePage} from "../../ugc-create/ugc-create";
import "rxjs/add/operator/first";
import {Util} from "../../../global/util";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { GlobalVariable } from "../../../global/global.variable";
import { Http,RequestOptions,Headers } from '@angular/http';
import { normalizeURL } from 'ionic-angular';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File } from '@ionic-native/file';
import { PhotoLibrary } from '@ionic-native/photo-library';
declare var window;
declare let MediaPicker;
declare let PjPlugin:any;
@Component({
  selector: 'challenge-item',
  templateUrl: 'challenge-item.html'
})
export class ChallengeItemComponent {

  @Input()
  challengeData;

  @Input()
  badge:any;

  @Output()
  clickEvent = new EventEmitter<number>();
  pictureSubject: Subject<string>;
  picturesToUpload = [];
  open_text_answer;
  public isUploading = false;
  public uploadingProgress = {};
  public uploadingHandler = {};
  public images: any = [];
  protected imagesValue: Array<any>;
  protected uploadFinished = false;
  maxPictureCount = 9;
  createLink:any;
  edit: boolean = false;
  imageUrl:any;
  private win: any = window;
  productImage:any;
  counter=false;
  imageCount = 0;
  hasClicked = false;
  imageSource = "";
  characterLength = 0;
  userId;
  perc = 0;
  count = 0;
  length = 0;
  constructor(private navCtrl:NavController,
  private httpService:HttpService,
  public platform: Platform,
  private transfer: FileTransfer,
  public  http: Http,private cdRef: ChangeDetectorRef,
  private camera: Camera,
  public sanitization: DomSanitizer,
  private actionSheetCtrl: ActionSheetController,
  private toastCtrl: ToastController,
  public photolib: PhotoLibrary,
  private webview: WebView,
  private file: File,
  private alertCtrl: AlertController) {
    this.productImage ={
      'imageArray':''
    }
    this.createLink ={
      'link':''
    }
    this.userId =  localStorage.getItem("UserData.userId");
    this.imageUrl = localStorage.getItem("myImageUrl");
    this.open_text_answer="";
    this.counter = true;
    
    if (typeof this.images === 'undefined') this.images = [];
    else {
      var i: number = 0;
      this.edit = true;
      for (let image of this.images) {
        this.images[i] = this.imageUrl + image;
        i++;
      }
    }
  }
  downloadImages(image) {
    let self = this;
    var tempDirectory = this.platform.is("ios") ? this.file.tempDirectory : this.file.externalDataDirectory;
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer.download(image, tempDirectory + Date.now()+'_pjimage.jpg', true).then((entry) => {
      if (this.platform.is("ios")) {
        PjPlugin.saveImage((s) => {
          let toast3 = this.toastCtrl.create({
            message: ' 图片已下载 ',
            duration: 3000,
            position: 'top'
          });
          toast3.present();
        }, (f) => {
          if (f == 'PHOTO_ACCESS_DENIED') {
            let toast3 = this.toastCtrl.create({
              message: 'Please enable permission',
              duration: 3000,
              position: 'bottom'
            });
            toast3.present();
          }
        },[entry.toURL()])
      } else {
        self.photolib.saveImage(entry.toURL(),"PJdaren").then(() =>{
          let toast3 = this.toastCtrl.create({
            message: ' 图片已下载 ',
            duration: 3000,
            position: 'top'
          });
          toast3.present();
        }, err =>{
          let toast3 = this.toastCtrl.create({
            message: err,
            duration: 3000,
            position: 'bottom'
          });
          toast3.present();
        })
      }
    }, (error) => {
      let toast3 = this.toastCtrl.create({
        message: '有问题出现，过一会儿重试一下！',
        duration: 2000,
        position: 'bottom'
      });
      toast3.present();
    });
  }
  ionDidLoad(){
    setTimeout(() => {
      let element = document.querySelectorAll('.html-content img');
      let self = this;
      for (let index = 0; index < element.length; index++) {
        const item = element[index];
        item.addEventListener('click', function(){
          self.imageSource = item.getAttribute('src');
          self.alertCtrl.create({
            message: '<div class="img"><img src=' + self.imageSource + '></div>',
            cssClass: 'image',
            buttons: [
              {
                text: '下载 ',
                cssClass: 'download-btn',
                handler: () => {
                  self.downloadImages(self.imageSource);
                }
              },
              {
                text: '',
                cssClass: 'close-btn',
                role: 'cancel'
              }
            ]
          }).present();
        })
      }
    }, 500);
  }
  onClick(challengeData:any) {
    this.ionDidLoad();
    this.images = [];
    if(challengeData.badgeChallengeStatus == "approved" || challengeData.badgeChallengeStatus == "hold"){
      // Util.showSimpleToastOnTop("Challenge attempted", this.toastCtrl);
      Util.showSimpleToastOnTop("此任务已提交", this.toastCtrl);
    }else{
      if (this.challengeData.products.length > 0) {
        this.getProduct();
      } else {
        this.clickEvent.emit(this.challengeData.id);
      }
    }
  }
  getProduct(){
    this.httpService.GetProductByID(this.challengeData.products[0].id).subscribe(res => {
      this.productImage = res.data;
      this.httpService.GetProductReviewByUserIdFollowedByOthersReview(this.challengeData.products[0].id,0,1).subscribe(resp =>{
        if(resp.content.length > 0){
          if(resp.content[0].userId == this.userId){
            var body = {
              "id":resp.content[0].id,
              "productId":resp.content[0].product.id,
              "userId":this.userId,
              "content":resp.content[0].content,
              "rating":resp.content[0].rating,
              "challengeId":this.challengeData.id,
            }
            this.httpService.UpdateProductReview(body).subscribe(res =>{
              Util.showSimpleToastOnTop("此任务已提交", this.toastCtrl);
              this.challengeData.badgeChallengeStatus = 'hold';
            });
          } else{
            this.clickEvent.emit(this.challengeData.id);
          }
        } else {
          this.clickEvent.emit(this.challengeData.id);
        }
      },error =>{});
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
  openImagePicker() {
    var args = {
      'selectMode': 100,
      'maxSelectCount': (9 - this.images.length),
      'maxSelectSize': 188743680,
    };
      MediaPicker.getMedias(args, (medias) => {
        //this.compress(medias);
        for (let i = 0; i < medias.length; i++) {
          this.images.push(medias[i].uri);
          this.cdRef.detectChanges();
        }
      }, (e) => {})
  }
  compress(medias){
    var self = this;
    for (let i = 0; i < medias.length; i++) {
      medias[i].quality = '60';
      MediaPicker.compressImage(medias[i], function(compressData) {
        self.images.push(compressData.path);
      }, function(e) {});
    }
  }
  removeItem(item) {
    let index: number = this.images.indexOf(item);
    if (index !== -1) {
      this.images.splice(index, 1);
    }
  }
  takePicture() {
    let options = {
      allowEdit: true
    };
    this.camera.getPicture(options)
      .then((data) => {
        this.images.push(normalizeURL(data));
      }, function (error) {console.log(error);});
  }
  uploadImages(){
      this.isUploading = true;
      if (this.images.length == 0) {
        Util.showSimpleToastOnTop("请选择图片", this.toastCtrl);
        return;
      }
      this.imageCount = 0;
      this.length = this.images.length;
      this.count = 0;
      this.cdRef.detectChanges();
      this.images.reduce((promise:any, item:any) => {
        return promise.then((result) => {
          this.postUploadReviewImages(item);
        });
      }, Promise.resolve())
  }
  postUploadReviewImages(image) {
    this.hasClicked = true;
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: "files",
      fileName: GlobalVariable.uploadImgName,
      chunkedMode: false,
      httpMethod: "post",
      headers:{"Authorization": "Bearer " + GlobalVariable.token},
      mimeType: "multipart/form-data",
      params:{
        'badgeId':this.challengeData.badgeId,
        'challengeId':this.challengeData.id,
        'userId':parseInt(localStorage.getItem("UserData.userId"))
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
    fileTransfer.upload(image, HttpService.baseUrl + "/badge/badge-answer/picture", options).then((data) => {
      this.count++;
      console.log(this.count);
      this.imageCount++;
      this.cdRef.detectChanges();
      if(this.imageCount == this.images.length  || this.length == 0){
        this.imageCount = 0;
        this.images = [];
        this.navCtrl.push(CampaignBadgeDetailPage).then(()=>{
          this.images = [];
          this.hasClicked = false;
          let currentIndex = this.navCtrl.getActive().index - 1;
          this.navCtrl.remove(currentIndex);
          this.alertCtrl.create({
            title: "恭喜你~！已成功提交",
            message: "提交的任务，很快就会有审核结果的！",
            cssClass: 'okcancel',
            buttons: ["确定"]
          }).present();
        });
      }
    }, (err) => {
      this.imageCount++;
      if(this.imageCount == this.images.length){
        this.imageCount = 0;
        this.images = [];
        console.log(err);
        this.showToast('有地方出错，请重新试一下！');
      }
    });
  }
  rejectedStatus(data){
    this.alertCtrl.create({
      title: "失败",
      message: data.comment,
      cssClass: 'okcancel ql-editor wider',
      buttons: ["确定"]
    }).present();
  }
  private uploadImage(targetPath,challengeId,badgeId) {
      return new Promise((resolve, reject) => {
          this.uploadingProgress[targetPath] = 0;
          if (window['cordova']) {
              let options:FileUploadOptions = {
                  // fileKey: "files",
                  fileKey: 'image',
                  fileName: GlobalVariable.uploadImgName,
                  chunkedMode: false,
                  httpMethod: "post",
                  headers:{"Authorization": "Bearer " + GlobalVariable.token},
                  // mimeType: "multipart/form-data",
                  params:{
                    'badgeId':badgeId,
                    'challengeId':challengeId,
                    'userId':parseInt(localStorage.getItem("UserData.userId"))
                  }
              };
              const fileTransfer: FileTransferObject = this.transfer.create();
              this.uploadingHandler[targetPath] = fileTransfer;
              fileTransfer.upload(targetPath, HttpService.baseUrl+"/badge/badge-answer/picture", options).then(data => {
                  resolve(JSON.parse(data.response));
              }).catch(() => {
                  // askRetry();
              });

              fileTransfer.onProgress(event2 => {
                  this.uploadingProgress[targetPath] = event2.loaded * 100 / event2.total;
              });
          } else {
              const xhr = new XMLHttpRequest();
              xhr.open('GET', targetPath, true);
              xhr.responseType = 'blob';
              xhr.onload = (e) => {
                  if (xhr['status'] != 200) {
                      this.util.showToast("Your browser doesn't support blob API");
                      console.error(e, xhr);
                      // askRetry();
                  } else {
                      const blob = xhr['response'];
                      let formData: FormData = new FormData();
                      let  xhr2: XMLHttpRequest = new XMLHttpRequest();
                      formData.append('files', blob);
                      formData.append('badgeId', badgeId);
                      formData.append('challengeId', challengeId);
                      formData.append('userId', localStorage.getItem("UserData.userId"));
                      this.uploadingHandler[targetPath] = xhr2;
                      xhr2.onreadystatechange = () => {
                          if (xhr2.readyState === 4) {
                              if (xhr2.status === 200)
                                  resolve(JSON.parse(xhr2.response));
                              // else
                                  // askRetry();
                          }
                      };
                      xhr2.upload.onprogress = (event) => {
                          this.uploadingProgress[targetPath] = event.loaded * 100 / event.total;
                      };
                      xhr2.open('POST', HttpService.baseUrl+"/badge/badge-answer/picture", true);
                      xhr2.setRequestHeader("Authorization", "Bearer " + GlobalVariable.token);
                      xhr2.send(formData);
                  }
              };
              xhr.send();
          }

          let askRetry = () => {
              // might have been aborted
              if (!this.isUploading) return reject(null);
              this.util.confirm('想再试试吗？', '上传失败了').then(res => {
                  if (!res) {
                      this.isUploading = false;
                      for (let key in this.uploadingHandler) {
                          this.uploadingHandler[key].abort();
                      }
                      return reject(null);
                  }
                  else {
                      if (!this.isUploading) return reject(null);
                      this.uploadImage(targetPath,challengeId,badgeId).then(resolve, reject);
                  }
              });
          };
      });
  }
  
  showToast(text: string) {
      this.toastCtrl.create({
          message: text,
          duration: 5000,
          position: 'bottom'
      }).present();
  }

  protected showAddImage() {
    if (!window['cordova']) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/x-png,image/gif,image/jpeg";
        input.click();
        input.onchange = () => {
            let blob = input.files[0];
            this.images.push(blob);
            this.util.trustImages();
        }
    } else {
        new Promise((resolve, reject) => {
            let actionSheet = this.actionSheetCtrl.create({
                title: 'Add a photo',
                buttons: [
                    {
                        text: '从相册',
                        handler: () => {
                            resolve(this.camera.PictureSourceType.PHOTOLIBRARY);
                        }
                    },
                    {
                        text: '拍照',
                        handler: () => {
                            resolve(this.camera.PictureSourceType.CAMERA);
                        }
                    },
                    {
                        text: '取消',
                        role: 'cancel',
                        handler: () => {
                            reject();
                        }
                    }
                ]
            });
            actionSheet.present();
        }).then(sourceType => {
            if (!window['cordova'])
                return;
            let options: CameraOptions = {
                quality: 75,
                sourceType: sourceType as number,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };
            this.camera.getPicture(options).then((imageData) => {
                this.images.push(imageData);
                this.util.trustImages();
            });
        }).catch(() => {
        });
    }
  }
  private util = ((_this: any) => {
      return {
          removeFromArray<T>(array: Array<T>, item: T) {
              let index: number = array.indexOf(item);
              if (index !== -1) {
                  array.splice(index, 1);
              }
          },
          confirm(text, title = '', yes = "Yes", no = "No") {
              return new Promise(
                  (resolve) => {
                      _this.alertCtrl.create({
                          title: title,
                          cssClass: 'okcancel',
                          message: text,
                          buttons: [
                              {
                                  text: no,
                                  role: 'cancel',
                                  handler: () => {
                                      resolve(false);
                                  }
                              },
                              {
                                  text: yes,
                                  handler: () => {
                                      resolve(true);
                                  }
                              }
                          ]
                      }).present();
                  }
              );
          },
          trustImages() {
              _this.imagesValue = _this.images.map(
                  val => {
                      return {
                          url: val,
                          sanitized: _this.sanitization.bypassSecurityTrustStyle("url(" + val + ")")
                      }
                  }
              );
          },
          showToast(text: string) {
              _this.toastCtrl.create({
                  message: text,
                  duration: 5000,
                  position: 'bottom'
              }).present();
          }
      }
  })(this);

  onClickLink() {
      this.challengeData.status = "COMPLETE";
  }

  reviewProduct(product:any,challengeData:any){
    this.navCtrl.push(ProductDetailPage, {
      item: product,
      badgeId: challengeData.badgeId,
      from: "challenge",
      challengeId: challengeData.id,
    });
  }

  goToWriteBlog(challengeId:number){
    this.navCtrl.push(UgcCreatePage,{challengeId:challengeId});
  }
  submitAnswer(challengeData:any){
    this.open_text_answer = this.open_text_answer.trimLeft();
    this.open_text_answer = this.open_text_answer.trimRight();
    this.httpService.AddSubmitAnswerChallange(this.open_text_answer,challengeData.badgeId,challengeData.id).subscribe((res => {
      this.alertCtrl.create({
        title: "恭喜你~！已成功提交",
        message: "提交的任务，很快就会有审核结果的！",
        cssClass: 'okcancel',
        buttons: ["确定"]
      }).present();
      this.navCtrl.push(CampaignBadgeDetailPage).then(()=>{
        let currentIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(currentIndex);
      });
    }),error =>{
      console.log(error);
    });
  }
  change(value) {
    let trimValue = value.replace(/\s/g,'');
    this.characterLength = trimValue.length;
    if (this.characterLength >= 5) {
      this.counter = false;
    } else {
      this.counter = true;
    }
  }
  submitLink(challengeData:any){
    if (!(this.createLink.link.toLowerCase().includes("http://") || this.createLink.link.toLowerCase().includes("https://"))) {
      this.showToast("请提交正确的链接! \n 请提交正确的链接 !");
      return
    }
    this.httpService.AddSubmitLinkChallange(this.createLink.link,challengeData.badgeId,challengeData.id).subscribe((res => {
      this.alertCtrl.create({
        title: "恭喜你~！已成功提交",
        message: "提交的任务，很快就会有审核结果的！",
        cssClass: 'okcancel',
        buttons: ["确定"]
      }).present();
      this.navCtrl.push(CampaignBadgeDetailPage).then(()=>{
        let currentIndex = this.navCtrl.getActive().index - 1;
        this.navCtrl.remove(currentIndex);
      });
    }));
  }
}
