import {Component, ChangeDetectorRef} from '@angular/core';
import {IonicPage,NavController, ViewController, NavParams, Platform} from 'ionic-angular';
import {ProfileSocialImpactPage} from "../../profile-social-impact/profile-social-impact";
// import {TimeLinePage} from "../../timeline/timeline";
import {HttpService} from "../../../services/httpService";
// import {GlobalVariable} from "../../../global/global.variable";

@IonicPage()
@Component({
  selector: 'page-sign-up-interest',
  templateUrl: 'sign-up-interest.html'
})
export class SignUpInterestPage {
  pageNo:number = 0;
  indexValue=0;
  interests;
  imageUrl:any;
  userData:any;
  interestsIds:any;
  badgeListTemp;
  public unregisterBackButtonAction: any;
  constructor(public navCtrl: NavController,
            public navParams:NavParams,
            public viewCtrl:ViewController,
            public platform:Platform,
            private changeDetectorRef: ChangeDetectorRef,
              public httpService: HttpService) {
    this.interests = [];
    this.interestsIds = [];
    this.badgeListTemp = [];
    // this.getInterestParentCat();
    this.getBadgesSummerisedListByPagination();
    this.imageUrl = localStorage.getItem("myImageUrl");
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
  getBadgesSummerisedListByPagination(){
    this.httpService.GetBadgesSummerisedListByPagination(this.pageNo,"1,2").subscribe(res =>{
      // this.interests = res;
      for (let index = 0; index < res.length; index++) {
        if (res[index].recordStatus == "ACTIVE") {
          this.badgeListTemp.push(res[index]); 
        }
      }
      this.httpService.GetBadgesSummerisedListByPagination(this.pageNo+1,"1,2").subscribe(res =>{
        for (let index = 0; index < res.length; index++) {
          if (res[index].recordStatus == "ACTIVE") {
            this.badgeListTemp.push(res[index]);
          }
        }
        this.interests = this.badgeListTemp.sort((a,b)=>{a.id < b.id});
        // this.changeDetectorRef.detectChanges();
      });
    });
  }
  getInterestParentCat(){
      this.httpService.GetBadgesList(this.pageNo).subscribe(res=>{
      this.interests = res;
    });
  }
  startTutorial(){
    setTimeout(() => {
      console.log("setTimeout");
      this.indexValue = 1;
      this.changeDetectorRef.detectChanges();
    }, 500);
  }
  completedInterest() {
    const selectedInterests = this.interests.filter(interest => {
      return interest.hasOwnProperty("isSelected") && !!interest["isSelected"];
    });
    for(let item of selectedInterests){
      this.interestsIds.push(item.id)
    }
    this.httpService.AddUserInterest(this.interestsIds).subscribe(res => {
        this.navCtrl.push(ProfileSocialImpactPage, {isSignUp: true,userData:JSON.parse(localStorage.getItem("UserData"))}).then(()=>{
          this.indexValue = 4;
        });
    });
  }
  toggleItem(item) {
    item.isSelected = (!item.hasOwnProperty("isSelected") || !item.isSelected);
  }
  nextTutorial(){
    if(this.indexValue <= 4){
        this.indexValue++;
    }
    if(this.indexValue == 5){
      this.completedInterest();
    }
    this.changeDetectorRef.detectChanges();
  }
}
