import {Component, ElementRef, ViewChild, ChangeDetectorRef} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {Headers, Http, RequestOptions} from "@angular/http";
import {HttpService} from "../../services/httpService";
import {DomSanitizer} from "@angular/platform-browser";
import "rxjs/add/operator/first";
import {Camera,CameraOptions} from '@ionic-native/camera';
import {GlobalVariable} from "../../global/global.variable";
import {ToastController,ActionSheetController,ModalController,AlertController,Platform} from 'ionic-angular';
import {NavController, NavParams} from 'ionic-angular';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {Util} from "../../global/util";
import {Crop} from "@ionic-native/crop";
import {UgcSelectorPage} from "../ugc-selector/ugc-selector";
import { SettingsProvider } from '../../providers/settingsProvider';
import { ProfileMyUgcPage } from '../profile-my-ugc/profile-my-ugc';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { CampaignBadgeDetailPage } from '../../pages/campaign-badge-detail/campaign-badge-detail';
import { ImageResizer, ImageResizerOptions } from '@ionic-native/image-resizer';
import { File } from '@ionic-native/file';
import { StatusBar } from '@ionic-native/status-bar';
declare var window;
declare let MediaPicker;
@Component({
  selector: 'page-ugc-create',
  templateUrl: 'ugc-create.html',
})
export class UgcCreatePage {
  @ViewChild('canvas') canvas: HTMLCanvasElement;
  postDescription: string;
  postTitle: string;
  ugcId: any;
  private win: any = window;
  createUgc: any;
  data: any;
  imageContents: any;
  imageSubject: Subject<string>;
  imageURI: any;
  imageFileName: any;
  challengeId: any;
  public isUploading = false;
  public uploadingProgress = {};
  public uploadingHandler = {};
  public images: any = [];
  protected imagesValue: Array<any>;
  protected uploadFinished = false;
  maxPictureCount = 9;
  imageUrl: any;
  prohibitedWords: any = [];
  _isFocus:false;
  setBoolean = false;
  perc = 0;
  count = 0;
  length = 0;
  constructor(private alertCtrl: AlertController,
              private file: File,
              private transfer: FileTransfer,
              public UserService: HttpService,
              public sanitization: DomSanitizer,
              public navCtrl: NavController,
              public toastCtrl: ToastController,
              private changeDetectorRef: ChangeDetectorRef,
              private actionSheetCtrl: ActionSheetController,
              public  http: Http,
              public statusBar: StatusBar,
              private webview: WebView,
              public  platform: Platform,
              public  httpService: HttpService,
              private camera: Camera,
              public navParams: NavParams,
              private imageResizer: ImageResizer,
              private modalCtrl: ModalController,
              private cropService: Crop,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.createUgc = {
      'postTitle': '',
      'postDescription': ''
    };
    this.challengeId = navParams.get('challengeId');
    if(this.challengeId == undefined){
      this.challengeId = '';
    }
    this.GetProhibitedWordsList();
    this.openSelectorModal('CLOSE');
    this.setBoolean = false;
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.productSlider.stopAutoplay();
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.styleLightContent();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2742');
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
    this.images = [];
    this.imagesValue = [];
  }
  ionViewWillEnter() {
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.styleDefault();
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.styleLightContent();
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    Util.unRegisterBackButton(this.platform, this.navCtrl);
  }
  openSelectorModal(action = null) {
    let selectorModal: any;
    if (action != null) {
      selectorModal = this.modalCtrl.create(UgcSelectorPage, {'action': 'CLOSE', 'platform': this.platform});
    } else {
      selectorModal = this.modalCtrl.create(UgcSelectorPage, {'platform': this.platform});
    }
    selectorModal.onDidDismiss(res => {
      if (!!res && res == 'FROM_LIBRARY') {
        this.openImagePicker();
      } else if (!!res && res == 'FROM_CAMERA') {
        this.takePicture();
      } else if (!!res && res == 'CLOSE') {
        this.navCtrl.pop();
      }
    });
    selectorModal.present();
  }

  GetProhibitedWordsList() {
    this.httpService.getProhibitedWordsList().subscribe(res => {
      this.prohibitedWords = res;
    });
  }
  titleLength = 0;
  descLength = 0;
  change(value, type) {
    let trimValue = value.replace(/\s/g,'');
    if(type == 'title') {
      this.titleLength = trimValue.length;
    } else{
      this.descLength = trimValue.length;
    }
  }
  saveImages() {
    let flag = 0;
    if(this.titleLength == 0){
      this.createUgc.postTitle = '';
    }
    if(this.descLength == 0){
      this.createUgc.postDescription = '';
    }
    if (this.createUgc.postTitle == '' || this.createUgc.postDescription == '') {
      this.alertCtrl.create({
        title: "",
        message: "必须添加标题和描述哦！",
        cssClass: 'okcancel',
        buttons: ["确定"]
      }).present();
      return;
    }
    for (let word of this.prohibitedWords) {
      if (this.createUgc.postTitle.search(word) != -1 || this.createUgc.postDescription.search(word) != -1) {
        flag = 1;
        break;
      }
    }
    if(flag == 1){
      let alert = this.alertCtrl.create({
        title: '警告！',
        message: '标题或描述含有禁用语，请勿使用任何禁用语',
        buttons: [
          {
            text: 'Okay',
            role: 'cancel'
          }
        ]
      });
      alert.present();
      return;
    }
    this.createUgc.postTitle = this.createUgc.postTitle.trimLeft();
    this.createUgc.postTitle = this.createUgc.postTitle.trimRight();
    this.createUgc.postDescription = this.createUgc.postDescription.trimLeft();
    this.createUgc.postDescription = this.createUgc.postDescription.trimRight();
    let formData: FormData = new FormData();
    formData.append('title', this.createUgc.postTitle);
    formData.append('content', this.createUgc.postDescription);
    formData.append('featured', '0');
    formData.append('challengeId', this.challengeId);
    formData.append('timelineContent', 'UGC');
    if (this.images.length != 0) {
      this.setBoolean = true;
      var oHeaders = new Headers();
      oHeaders.set("Authorization", "Bearer " + GlobalVariable.token);
      this.http.post(HttpService.baseUrl + "/ugc", formData, new RequestOptions({headers: oHeaders})).toPromise().then((response) => {
        this.toastCtrl.create({
          message: "正在发布中...",
          duration: 3000,
          position: 'top'
        }).present();
        this.postUploadUGCImages(response.json().id);
      });
    } else {
      this.alertCtrl.create({
        title: "",
        message: "请选择图片!",
        cssClass: 'okcancel',
        buttons: ["确定"]
      }).present();
    }
  }

  openImagePicker() {
    let self = this;
    var args = {
      'selectMode': 100,
      'maxSelectCount': (9 - this.images.length),
      'maxSelectSize': 188743680,
    };
    MediaPicker.getMedias(args, (medias) => {
      self.reduceImages(medias).then(() => {
        console.log('all images cropped!!');
      });
    }, (e) => {})
  }
  reduceImages(selected_pictures: any) : any{
    return selected_pictures.reduce((promise:any, item:any) => {
      return promise.then((result) => {
        let qualityVal = 75;
        if(item.size > 5242880){ qualityVal = 30 }
        return this.cropService.crop(item.uri, {quality: qualityVal, targetHeight: 120,targetWidth: 100})
				.then(cropped_image => {
          this.images.push(cropped_image);
          this.changeDetectorRef.detectChanges();
          // this.createThumbnail(cropped_image);
        });
      });
    }, Promise.resolve());
  }
  
  postUploadUGCImages(ugcId: number) {
    this.length = this.images.length - 1;
    this.count = 0;
    const fileTransfer: FileTransferObject = this.transfer.create();
    let options: FileUploadOptions = {
      fileKey: "image",
      fileName: GlobalVariable.uploadImgName,
      chunkedMode: false,
      headers:{"Authorization": "Bearer " + GlobalVariable.token},
      httpMethod: "post",
      params: {"id":ugcId}
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
        var imageUri = item;
        fileTransfer.upload(imageUri, HttpService.baseUrl + "/ugc/image", options).then((data) => {
          this.count++;
          if (this.count == this.length || this.length == 0){
            if(this.challengeId  == ''){
              this.navCtrl.pop();
              this.navCtrl.push(ProfileMyUgcPage, {
                title: "粉丝专题",
                userId:localStorage.getItem("UserData.userId")
              });
            }else{
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
            }
          }
        }, (err) => {
          this.toastCtrl.create({
            message: 'error uploading:' + err.body,
            duration: 3000,
            position: 'top'
          }).present();
        });
      });
    }, Promise.resolve())
  }

  postNewUGC() {
    let flag = 0;
    for (let word of this.prohibitedWords) {
      if (this.postDescription.search(word) != -1) {
        let alert = this.alertCtrl.create({
          title: '警告！',
          message: '此评价包含禁用词，请勿使用任何禁用词。',
          buttons: [{
              text: 'Okay',
              role: 'cancel'
            }]
        });
        alert.present();
        flag = 1;
      }
    }
    if (flag == 0) {
      this.postTitle = this.postTitle.trimLeft();
      this.postTitle = this.postTitle.trimRight();
      this.postDescription = this.postDescription.trimLeft();
      this.postDescription = this.postDescription.trimRight();
      var oHeaders = new Headers();
      oHeaders.set("Authorization", "Bearer " + GlobalVariable.token);
      let formData: FormData = new FormData();
      if (typeof this.ugcId !== 'undefined') formData.append('id', this.ugcId.toString());
      formData.append('content', this.postDescription);
      formData.append('title', this.postTitle);
      formData.append('userId', localStorage.getItem("UserData.userId"));

      this.http.post(HttpService.baseUrl + "/ugc", formData, new RequestOptions({headers: oHeaders}))
        .toPromise()
        .then((response) => {
          this.postUploadUGCImages(response.json().id);
        });
    }
  }
  removeItem(item) {
    let index: number = this.images.indexOf(item);
    if (index !== -1) {
      this.images.splice(index, 1);
    }
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
              text: 'Cancel',
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
        if (sourceType == this.camera.PictureSourceType.PHOTOLIBRARY) {
          var args = {
            'selectMode': 100, //101=picker image and video , 100=image , 102=video
            'maxSelectCount': (9 - this.images.length), //default 40 (Optional)
            'maxSelectSize': 188743680, //188743680=180M (Optional)
          };
          MediaPicker.getMedias(args, (medias) => {
            this.reduceImages(medias).then(() => {
              console.log('all images cropped!!');
            });
          }, (e) => {
          })
        } else {
          let options: CameraOptions = {
            quality: 75,
            sourceType: sourceType as number,
            saveToPhotoAlbum: false,
            correctOrientation: true
          };
          this.camera.getPicture(options).then((imageData) => {
            this.cropService.crop(imageData, {quality: 75, targetWidth: 100, targetHeight: 120}).then((newImage) => {
              this.images.push(newImage);
              this.changeDetectorRef.detectChanges();
            }, error => console.error("Error cropping image", error));
            this.util.trustImages();
          });
        }
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

  presentActionSheet() {
    this.openSelectorModal();
  }

  takePicture() {
    let options = {
      quality: 75,
      targetWidth: 1200,
      targetHeight: 600,
      correctOrientation: true
    };
    this.camera.getPicture(options).then((data) => {
      this.cropService.crop(data, {quality: 75, targetWidth: 100, targetHeight: 120}).then((newImage) => {
        this.images.push(newImage);
        this.changeDetectorRef.detectChanges();
      }, error => console.error("Error cropping image", error));
    }, function (error) {
      console.log(error);
    });
  }

  createThumbnail(image) {
    this.generateFromImage(image, 600, 600, 1, data => {
      this.images.push(data);
      this.changeDetectorRef.detectChanges();
    });
  }
 
  generateFromImage(img, MAX_WIDTH: number = 700, MAX_HEIGHT: number = 700, quality: number = 1, callback) {
    var canvas: any = document.createElement("canvas");
    var image = new Image();
    image.onload = () => {
      var width = image.width;
      var height = image.height;
 
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
 
      ctx.drawImage(image, 0, 0, width, height);
      var dataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(dataUrl)
    }
    image.src = this.platform.is("ios") ? img : this.win.Ionic.WebView.convertFileSrc(img);
  }
  getFileEntry(imgUri) {
   return imgUri;
  }
}
