import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {NavController, Platform} from "ionic-angular";
import {TimeLinePage} from "../../pages/timeline/timeline";
import {SettingsProvider} from "../../providers/settingsProvider";
import {UgcPage} from "../../pages/ugc/ugc";
import {NoticePage} from "../../pages/notice/notice";
import {ProfilePage} from "../../pages/profile/profile";
// import {BadgeListPage} from "../../pages/badge-list/badge-list";
import {ProfileMyBadgePage} from "../../pages/profile-my-badge/profile-my-badge";
import {ProductCategoryPage} from "../../pages/product-category/product-category";
import {SignInUpPage} from "../../pages/sign-in-up/sign-in-up";
import {QrCodeScanPage} from "../../pages/qr-code-scan/qr-code-scan";
import {GlobalVariable} from "../../global/global.variable";
import {HttpService} from "../../services/httpService";
import {UgcCreatePage} from "../../pages/ugc-create/ugc-create";
import {AndroidPermissions} from '@ionic-native/android-permissions';
import {ImagePicker} from "@ionic-native/image-picker";


declare let MediaPicker;

@Component({
  selector: 'component-footer-menu',
  templateUrl: 'footer-menu.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterMenuComponent {
  selectedTab: number;
  isMenuOpened: boolean;
  badgeCount: any;
  messageCount: any;
  boxTrackCount: any;
  otherCount: any;
  public images: any = [];
  campaigns: any = [];
  badgesCounter: number = 0;

  constructor(private navCtrl: NavController,
              private httpService: HttpService,
              private settingsProvider: SettingsProvider,
              private imagePicker: ImagePicker,
              platform: Platform,
              private androidPermissions: AndroidPermissions,
              private cd: ChangeDetectorRef) {
    this.selectedTab = this.getCurrentTab();
    this.isMenuOpened = false;
    this.getCampaignListByUserId();
  }


  ngOnInit() {
    if (GlobalVariable.isAuthUser) {
      this.getUnreadMessageCount();
    }
  }

  getCampaignListByUserId() {
    this.httpService.GetCampaignListByUserId().subscribe(res => {
      this.campaigns = res;
      for (let data of this.campaigns) {
        this.badgesCounter = this.badgesCounter + data.badges.length;
      }
    });
  }

  goToTab(tabNumber: number) {
    if (!GlobalVariable.isAuthUser && (tabNumber == 3 || tabNumber == 4)) {
      alert("你必须登录才能看到此页面");
      this.navCtrl.setRoot(SignInUpPage, {from: "reg"});
    } else {
      this.selectedTab = tabNumber;
      this.settingsProvider.currentTab = tabNumber;
      this.navCtrl.setRoot(this.getTabPage(tabNumber));
    }
  }

  getTabPage(tabNumber: number): any {
    switch (tabNumber) {
      case 0:
        return TimeLinePage;
      case 1:
        return UgcPage;
      case 3:
        return NoticePage;
      case 4:
        return ProfilePage;
    }
  }

  getCurrentTab(): number {
    return this.settingsProvider.currentTab;
  }

  toggleMenu() {
    this.isMenuOpened = !this.isMenuOpened;
    this.cd.detectChanges();
    console.log("toggle menu " + this.isMenuOpened);
  }

  onSeeBadge() {
    if (!this.isMenuOpened) return;
    console.log("see badge");
    // this.navCtrl.push(BadgeListPage);
    this.navCtrl.push(ProfileMyBadgePage, {
      userId: this.settingsProvider.getCurrentUserId(),
      title: "我的勋章"
    });
  }

  //
  // showUgcCreate() {
  //   if(!GlobalVariable.isAuthUser){
  //     alert("You must be logged to see this page");
  //     this.navCtrl.setRoot(SignInUpPage,{from: "reg"});
  //   }else{
  //     this.androidPermissions.checkPermission
  //     (this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
  //       success => {
  //         this.navCtrl.push(UgcCreatePage);
  //       },
  //       err =>{
  //         this.androidPermissions.requestPermission
  //         (this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).
  //         then(success=>{
  //             this.navCtrl.push(UgcCreatePage);
  //           },
  //           err=>{
  //             alert("Permission needed to user Multimedia Files");
  //           });
  //       });
  //   }
  // }


  /*Click on Create UGC button to go to Create UGC Page after picking images from Gallary*/
  showUgcCreate() {
    if (!GlobalVariable.isAuthUser) {
      alert("你必须登录才能看到此页面");
      this.navCtrl.setRoot(SignInUpPage, {from: "reg"});
    } else {
      // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).then(
      //   success => {
      //     this.showImageGallary();
      //   },
      //   err => {
      //     this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE).
      //     then(success => {
      //         this.showImageGallary();
      //       },
      //       err => {
      //         alert("Permission needed to user Multimedia Files");
      //       });
      //   });
      this.navCtrl.push(UgcCreatePage);
    }
  }

  /*Show Image Gallary to pick Images max 9*/
  showImageGallary() {
    var args = {
      'selectMode': 100,
      'maxSelectCount': (9 - this.images.length),
      'maxSelectSize': 188743680,
    };
    MediaPicker.getMedias(args, (medias) => {
      for (let i = 0; i < medias.length; i++) {
        if (this.images.length < 9) {
          this.images.push(medias[i].uri);
        }
      }
      this.navCtrl.push(UgcCreatePage,{imagesArr:this.images});
      this.images = [];
    });
  }

  onWriteReview() {
    if (!this.isMenuOpened) return;
    console.log("write review");
    this.navCtrl.push(ProductCategoryPage);
  }

  onQrCode() {
    if (!this.isMenuOpened) return;
    console.log("qr code");
    this.navCtrl.push(QrCodeScanPage);
  }

  /*Messages Unread Count*/
  getUnreadMessageCount() {
    this.httpService.GetUnreadMessageCount("").subscribe(res => {
      this.messageCount = res.count;
    });
  }

  async setBadge() {
    if (this.otherCount + this.messageCount + this.boxTrackCount == 0) {
      this.badgeCount = '';
      this.otherCount = 0;
      this.messageCount = 0;
      this.boxTrackCount = 0;
    } else {
      this.badgeCount = this.otherCount + this.messageCount + this.boxTrackCount;
      if (this.otherCount == 0) {
        this.otherCount = '';
      }
      if (this.messageCount == 0) {
        this.messageCount = '';
      }
      if (this.boxTrackCount == 0) {
        this.boxTrackCount = '';
      }
    }
  }
}
