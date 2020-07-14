import {Component, ChangeDetectorRef} from '@angular/core';
import {NavController, NavParams, ToastController, LoadingController,ViewController, Platform,AlertController} from 'ionic-angular';
import {SignUpInterestPage} from "../sign-up-interest/sign-up-interest";
import {default as chinaData, City, Province} from "../../../data/chinaData";
import {Util} from "../../../global/util";
import {GlobalVariable} from "../../../global/global.variable";
import {TokenService} from "../../../services/tokenService";
import {HttpService} from "../../../services/httpService";
import {UserService} from "../../../services/userService";
import {User} from "../../../model/user";
import {Camera, CameraOptions} from '@ionic-native/camera';
import {FileTransfer, FileUploadOptions, FileTransferObject} from '@ionic-native/file-transfer';
import {Crop} from "@ionic-native/crop";
import { File } from '@ionic-native/file';
import { NotificationService } from '../../../services/notificationService';
declare let MediaPicker;
@Component({
  selector: 'page-sign-up-profile',
  templateUrl: 'sign-up-profile.html'
})
export class SignUpProfilePage {

  provinces: any;
  win: any = window;
  from: string= '';
  name: string= '';
  data: any = {};
  dob: string= '';
  gender: string= '';
  selectedProvince: any;
  selectedCity: any;
  selectedArea: any;
  referralCode: string = '';
  nickname: string = '';
  authToken:string= '';
  isFromLogIn: boolean;
  password: any= '';
  phoneNumber: any= '';
  imageUrl: string= '';
  dataId: any;
  phoneTemp: any;
  profilepic:string= '';
  public unregisterBackButtonAction: any;
  imageURI: any;
  imageFileName: any;
  imageContents: any;
  userData: any;
  userDataId: any;
  public imagess: any = [];
  pickerOptions: any = {
    mode:"ios",
  }
  img;
  resultUserId;
  constructor(private navCtrl: NavController,
    private navParams: NavParams,
    public toastCtrl: ToastController,
    private userService: UserService,
    private loadingCtrl: LoadingController,
    private viewCtrl: ViewController,
    private platform: Platform,
    private httpService: HttpService,
    private alertCtrl: AlertController,
    private changeDetectorRef: ChangeDetectorRef,
    private camera: Camera,
    private transfer: FileTransfer,
    private cropService: Crop,
    private notificationService: NotificationService,
    public file: File,
    private tokenService: TokenService) {
      this.notificationService.registerDevcie().catch(e =>{})
      this.resultUserId = this.navParams.get("resultData");
      console.log(this.resultUserId);
      console.log("inside SignupProfile");
      this.userData = JSON.parse(localStorage.getItem("UserData"));
      this.userDataId = localStorage.getItem("userId");
      this.isFromLogIn = !!this.navParams.get("isFromLogIn");
      this.authToken = this.navParams.get("Authorization");
      this.from = this.navParams.get("socialType");
      this.data = this.navParams.get("userData");
      console.log(this.data);//keep to debug on device
      this.password = this.navParams.get("password");
      this.phoneNumber = this.navParams.get("phoneNumber");
      this.imageUrl = localStorage.getItem("myImageUrl");
      this.dataId = localStorage.getItem("socialIdNew");
      this.phoneTemp = localStorage.getItem("phoneTemp");
      let loader = this.loadingCtrl.create({
        spinner: 'dots',
        content: '正在登陆'
      });
      loader.present();
      this.httpService.getProvinces('').subscribe(res => {
        localStorage.setItem("locations",JSON.stringify(res));
        this.provinces = res;
        loader.dismiss();
        this.provinces = JSON.parse(localStorage.getItem("locations"));
        if(this.from == 'WEIBO'){
          Util.setHasFormFilled("weibo");
          if(this.data){
            if(this.data.hasOwnProperty("name") == true){
              if(this.data.name != ""){
                this.name = this.data.name;
              }
            }else{
              this.name = "";
            }
            if(this.data.hasOwnProperty("screen_name") == true){
              if(this.data.screen_name != ""){
                this.nickname = this.data.screen_name;
              }
            }else{
              this.nickname = "";
            }
            if(this.data.hasOwnProperty("gender") == true){
              if(this.data.screen_name != ""){
                this.gender = this.data.gender;
                if(this.data.gender == "f"){
                  this.gender  ='F';
                }else{
                  this.gender  ='M';
                }
              }else{
                this.gender  ='M';
              }
            }else{
              this.gender = "M";
            }
            if(this.data.hasOwnProperty("profile_image_url") == true){
              if(this.data.profile_image_url != ""){
                this.profilepic = this.data.profile_image_url;
                // this.downloadImages(1);
              }
            }
          }
        }else if(this.from == 'WECHAT'){
          Util.setHasFormFilled("wechat");
          if(this.data){
            if(this.data.hasOwnProperty("nickname") == true){
              if(this.data.nickname != ""){
                this.name = this.data.nickname;
                this.nickname = this.data.nickname;
              }
            }else{
              this.name = "";
              this.nickname = "";
            }
            if(this.data.hasOwnProperty("sex") == true){
              if(this.data.sex != ""){
                this.gender = this.data.sex;
                if(this.data.gender == "2"){
                  this.gender  ='F';
                }else{
                  this.gender  ='M';
                }
              }
              else{
                this.gender  ='M';
              }
            }else{
              this.gender = "M";
            }
            if(this.data.hasOwnProperty("headimgurl") == true){
              if(this.data.headimgurl != ""){
                this.profilepic = this.data.headimgurl;
                // this.downloadImages(1);
              }
            }
          }
        }else{
          Util.setHasFormFilled("normal");
        }

        if (this.isFromLogIn) {
          Util.showSimpleToastOnTop("登陆成功！请完善个人信息！", toastCtrl);
          const user = this.navParams.get("userData");
          if(user) {
            this.name = user.name;
            if(user.dob)
              this.dob = user.dob.split('T')[0];
            this.gender = user.gender;
            this.nickname = user.nickname;
            if(user.profileImage) {
              this.profilepic = this.imageUrl + user.profileImage;
            }
            if(this.provinces!=null){
              this.selectedProvince = this.provinces.find(province => {
                return province.name == user.province;
              });
    
              if(this.selectedProvince == null) {
                return;
              }
    
              this.selectedCity = this.selectedProvince.cities.find(city => {
                return city.name == user.city;
              });
    
              if(this.selectedCity == null) {
                return;
              }
    
              this.selectedArea = this.selectedCity.districts.find(area => {
                return area == user.area;
              });
            }
            
          }
        }
      });
    }
    /*End Of Constructor*/
    onBlurValidateBlank(event){
      if(event.value.replace(/\s+/g, '').length == 0){
        event.value = "";
      }
    }
    ionViewDidLoad() {
        this.initializeBackButtonCustomHandler();
    }
    ionViewWillLeave() {
       // Unregister the custom back button action for this page
       this.unregisterBackButtonAction && this.unregisterBackButtonAction();
   }
   initializeBackButtonCustomHandler(): void {
        this.unregisterBackButtonAction = this.platform.registerBackButtonAction(function(event){
            console.log('Prevent Back Button Page Change');
        }, 101); // Priority 101 will override back button handling (we set in app.component.ts) as it is bigger then priority 100 configured in app.component.ts file */
    }


    ionViewWillEnter() {
      this.viewCtrl.showBackButton(false);
    }

    isIncomplete() {
      return Util.isEmpty(this.name) || Util.isEmpty(this.dob) || Util.isEmpty(this.gender)
      || Util.isEmpty(this.selectedProvince) || Util.isEmpty(this.selectedCity)
      || Util.isEmpty(this.selectedArea) || Util.isEmpty(this.nickname) || Util.isEmpty(this.profilepic);
    }
    
    submit(){
      if (this.isIncomplete()) return;

      if(!Util.isEmpty(this.referralCode)){
        let loader = this.loadingCtrl.create({
          spinner: 'dots',
          content: '...'
        });
        loader.present();
          this.httpService.addReferral(this.referralCode.toLowerCase()).subscribe( res => {
            loader.dismiss()
            console.log("refResult: " + JSON.stringify(res))
            if(res.referralCode && res.referralCode){
            //  Util.showSimpleToastOnTop('Successfully applied referral code', this.toastCtrl);
              this.referralCode = ''
              this.submitProfile()
              
            }else{
              Util.showSimpleToastOnTop('你输入的邀请码不正确', this.toastCtrl);
            }
          }, () => {
            loader.dismiss()
               Util.showSimpleToastOnTop('你输入的邀请码不正确', this.toastCtrl);
          } )

      }else{
        this.submitProfile();
      }

    }
    submitProfile() {
      if (this.isIncomplete()) return;
      // start spinner
      let loader = this.loadingCtrl.create({
        spinner: 'dots',
        content: '正在登陆'
      });
      loader.present();
       if(this.from == 'WECHAT'){
         let user = {
           profilepic: this.profilepic,
           name: this.name,
           dob: this.dob,
           gender: this.gender,
           //province: this.selectedProvince["name"],
           //city: this.selectedCity["name"],
           districtId: this.selectedArea["id"],
           //area: this.selectedArea["name"],
           nickname: this.nickname,
           phoneNumber : this.phoneTemp,
           password: this.password,
           email:  "",
           socialType: this.from,
           wechatSocialUniqueId: this.dataId,
           wechatUserDto:this.data,
           imageUrl: this.imageUrl
         };
         this.httpService.AddWechatUserData(user).subscribe(res => {
            this.tokenService.save(res.id_token);
            this.downloadImages();
            loader.dismiss();
            this.navCtrl.push(SignUpInterestPage);
            return;
         },error=>{
          Util.showSimpleToastOnTop('必填内容不能为空', this.toastCtrl);
        });
       }else if(this.from == 'WEIBO'){
         let user = {
          profilepic: this.profilepic,
           name: this.name,
           dob: this.dob,
           gender: this.gender,
           //province: this.selectedProvince["name"],
           //city: this.selectedCity["name"],
           districtId: this.selectedArea["id"],
           //area: this.selectedArea["name"],
           nickname: this.nickname,
           phoneNumber : this.phoneTemp,
           password: this.password,
           email:  "",
           socialType: this.from,
           weiboSocialUniqueId: this.dataId,
           weiboUserDto:this.data,
           imageUrl: this.imageUrl
         };
         this.httpService.AddWeiboUserData(user).subscribe(res => {
            this.tokenService.save(res.id_token);
            this.downloadImages();
            loader.dismiss();
            this.navCtrl.push(SignUpInterestPage);
            return;
        },error=>{
          Util.showSimpleToastOnTop('必填内容不能为空', this.toastCtrl);
        });
       }else{
         let user = {
            name: this.name,
            dob: this.dob,
            gender: this.gender,
            //province: this.selectedProvince["name"],
            //city: this.selectedCity["name"],
            districtId: this.selectedArea["id"],
            //area: this.selectedArea["name"],
            nickname: this.nickname,
            imageUrl: this.profilepic,
            pjToken: null
          };
          this.userService.update(user,"Bearer "+GlobalVariable.token)
          .subscribe(res => {
            let newPath = "/users/" + this.resultUserId + "/profile";
            this.cropImageAndPostUploadProfilePicture(newPath,this.profilepic);
            this.getUserDetails();
            loader.dismiss();
            this.navCtrl.push(SignUpInterestPage);
            return;
          },error=>{
            Util.showSimpleToastOnTop('必填内容不能为空', this.toastCtrl);
          });
       }

  }
  addImage(type: string) {
    const prompt = this.alertCtrl.create({
      title: "請選擇文件",
      buttons: [
        {
          text: "拍一张照片",
          handler: () => {
            console.log('take a picture');
            this.getImageFromCamera(type);
          }
        }, {
          text: "从相册中选择",
          handler: () => {
            console.log('go to gallery');
            this.getImageFromGallary(type);
          }
        }, {
          text: '取消',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    prompt.present();
  }
  getImageFromCamera(type: string) {
    const options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA
    }

    this.camera.getPicture(options).then((imageData) => {
      this.imageURI = imageData;
      this.imageContents = imageData;
      if(this.platform.is("ios"))
      localStorage.setItem("socialProfilePic", this.imageURI);
      else
      // localStorage.setItem("socialProfilePic", this.win.Ionic.WebView.convertFileSrc(this.imageURI));
      localStorage.setItem("socialProfilePic", this.imageURI);
      // this.profilepic = this.imageURI;
      this.cropService.crop(this.imageURI, {quality: 75,targetHeight:100,targetWidth:100}).then(
        newImage => {
          this.profilepic = newImage;
          this.changeDetectorRef.detectChanges();
          if(this.platform.is("ios"))
          localStorage.setItem("socialProfilePic", this.imageURI);
          else
          // localStorage.setItem("socialProfilePic", this.win.Ionic.WebView.convertFileSrc(this.imageURI));
          localStorage.setItem("socialProfilePic", this.imageURI);
        },
        error => console.error('Error cropping image', error)
      );
    }, (err) => {
      console.log(err);
      this.presentToast(err);
    });
  }

  getImageFromGallary(type: string) {
    var self = this;
    var args = {
      'selectMode': 100, //101=picker image and video , 100=image , 102=video
      'maxSelectCount': 1, //default 40 (Optional)
      'maxSelectSize': 188743680, //188743680=180M (Optional)
    };
    MediaPicker.getMedias(args, (medias) => {
      self.imageURI = medias[0].uri;
      self.imageContents = medias[0].uri;
      self.profilepic = self.imageURI;
      if(self.platform.is("ios"))
      localStorage.setItem("socialProfilePic", self.imageURI);
      else
      // localStorage.setItem("socialProfilePic", self.win.Ionic.WebView.convertFileSrc(self.imageURI));      // setTimeout(() => {
        localStorage.setItem("socialProfilePic", self.imageURI);      // setTimeout(() => {
      //   this.cropper(this.imageURI);
      // }, 5000);
      self.cropService.crop(medias[0].uri, {quality: 75,targetHeight:100,targetWidth:100}).then(
        newImage => {
          self.profilepic = newImage;
          this.changeDetectorRef.detectChanges();
          if(self.platform.is("ios"))
          localStorage.setItem("socialProfilePic", newImage);
          else
          // localStorage.setItem("socialProfilePic", self.win.Ionic.WebView.convertFileSrc(newImage));
          localStorage.setItem("socialProfilePic", newImage);
        },
        error => console.error('Error cropping image', error)
      );
    }, (e) => {
      console.log(e);
      self.presentToast(e);
    })
  }
  getUserDetails(){
    this.userService.getUserData()
    .subscribe(res =>{
      console.log("get user detail", res);
      this.tokenService.saveUserId(res.id);
      this.tokenService.saveIsUserAuth(true);
      localStorage.setItem("UserData",JSON.stringify(res));
      localStorage.setItem("UserData.login",res.login);
      localStorage.setItem("UserData.phoneNumber",res.phoneNumber);
      localStorage.setItem("UserData.nickname",res.nickname);
      localStorage.setItem("UserData.userId",res.id);
      localStorage.setItem("userId", res.id);
      if(res.email == null){
        localStorage.setItem("UserData.email","Please Set New");
      }else{
        localStorage.setItem("UserData.email",res.email);
      }
      if(this.from == 'WEIBO'){
        localStorage.setItem("socialProfilePic",this.imageUrl+res.profileImage);
      }else if(this.from == 'WECHAT'){
        localStorage.setItem("socialProfilePic",this.imageUrl+res.profileImage);
      }else{
        if(res.hasOwnProperty("profileImage")){
          localStorage.setItem("socialProfilePic",this.imageUrl+res.profileImage);
        }
        // else{
        //   if(res.gender == 'M'){
        //     localStorage.setItem("socialProfilePic","assets/img/profile/man.png");
        //   }else{
        //     localStorage.setItem("socialProfilePic","assets/img/profile/woman.png");
        //   }
        // }
      }
    });
  }
  presentToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom'
    });
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });
    toast.present();
  }
  cropImageAndPostUploadProfilePicture(path,imgpath){
    console.log("inside cropImageAndPostUploadProfilePicture");
    var self = this;
    // var options = {
    //   url: imagePath,
    //   ratio: "1/1",
    //   title: "Custom title",
    //   autoZoomEnabled: false
    // }
    // window['plugins'].k.imagecropper.open(options, function(data) {
      const fileTransfer: FileTransferObject = self.transfer.create();
      let option: FileUploadOptions = {
        fileKey: 'file',
        fileName: GlobalVariable.uploadImgName,
        chunkedMode: false,
        headers: {"Authorization": "Bearer " + GlobalVariable.token},
        httpMethod: "post",
      }
      console.log("going to upload " ,imgpath)
      fileTransfer.upload(imgpath, HttpService.baseUrl + path, option).then((data) => {
        console.log("upload");
        console.log(data);
        self.userService.getUserData().subscribe(res => {
          self.profilepic = res.profileImage;
          localStorage.setItem("socialProfilePic", res.profileImage);
          self.getUserDetails();
          self.navCtrl.push(SignUpInterestPage);
        })
      }, (err) => {
        console.log("upload error");
        console.log(err);
      });
  }
  downloadImages() {
    console.log("Inside downloadImages");
    var self = this;
    const fileTransfer: FileTransferObject = this.transfer.create();
    var tempDirectory = this.platform.is("ios")? this.file.tempDirectory : this.file.externalDataDirectory;
    console.log("externalDataDirectory: ", tempDirectory);
    fileTransfer.download(this.profilepic, tempDirectory + "socialProfilePic.jpg").then((entry) => {
      console.log("image downloaded", entry);
      this.cropImageAndPostUploadProfilePicture("/users/" + self.resultUserId + "/profile",entry.nativeURL);
    }, (error) => {
      console.error(error);
      this.getUserDetails();
    });
  }
}
