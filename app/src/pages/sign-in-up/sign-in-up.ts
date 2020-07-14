import {Component, ViewChild, ChangeDetectorRef} from '@angular/core';
import {IonicPage, NavController,NavParams, Platform} from 'ionic-angular';
import {SignUpComponent} from "./sign-up/sign-up.component";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
// import {SignUpProfilePage} from "./sign-up-profile/sign-up-profile";

@IonicPage({
  segment: "signInUp"
})
@Component({
  selector: 'page-sign-in-up',
  templateUrl: 'sign-in-up.html',
})
export class SignInUpPage {

  selectedTab: number;
  @ViewChild(SignUpComponent) signUpComponent;

  constructor(public navCtrl: NavController,
    public platform: Platform,
    private changeDetectorRef: ChangeDetectorRef,
    public navParams: NavParams,private settingsProvider:SettingsProvider) {
    this.selectedTab = 0;
    if(navParams.get('from') == "reg"){
      this.selectedTab = 1;
    }
  }
  ionViewWillLeave(){
    /*
    if(this.settingsProvider.slider != undefined){
      if(this.navCtrl.getPrevious() != null){
        let prevPage = this.navCtrl.getPrevious();
        this.settingsProvider.productSlider.startAutoplay();
        if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
          if(this.settingsProvider.showSearch){
            if(this.settingsProvider.slider != undefined){
              this.settingsProvider.slider.stopAutoplay();
            }
            if(this.settingsProvider.statusBar != undefined){
              this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
            }
          }else{
            if(this.settingsProvider.slider != undefined){
              this.settingsProvider.slider.startAutoplay();
            }
            if(this.settingsProvider.statusBar != undefined){
              this.settingsProvider.statusBar.backgroundColorByHexString(this.settingsProvider.statusbarColor);
            }
          }
        }
      }
    }
    */
  }
  ionViewWillEnter(){
    if(this.settingsProvider.slider != undefined){
      this.settingsProvider.slider.stopAutoplay();
    }
    if(this.settingsProvider.statusBar != undefined){
      if(this.platform.is("ios")){
        this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
      }else{
        this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
      }
    }
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }

  changeTab(tabNumber: number) {
    this.selectedTab = tabNumber;
    this.changeDetectorRef.detectChanges();
  }

  signUp() {
    this.signUpComponent.register();
  }

}
