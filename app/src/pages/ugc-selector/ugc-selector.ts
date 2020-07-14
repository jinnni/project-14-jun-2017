import {Component, OnInit} from '@angular/core';
import {IonicPage, NavParams, ViewController, NavController, Platform} from 'ionic-angular';
import {UgcCreatePage} from "../ugc-create/ugc-create";
import {Util} from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';


@IonicPage()
@Component({
  selector: 'page-ugc-selector',
  templateUrl: 'ugc-selector.html',
})
export class UgcSelectorPage implements OnInit {
  action: string = null ;
  constructor(public viewCtrl: ViewController,
    private navCtrl:NavController,
    public navParams: NavParams,
    public platform:Platform,
    private settingsProvider:SettingsProvider) {
  }
  ngOnInit() {
    this.action = this.navParams.get('action') || null;
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      this.settingsProvider.productSlider.startAutoplay();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.productSlider.stopAutoplay();
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString('');
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
  ionViewDidLoad(){
    this.settingsProvider.slider.stopAutoplay();
    if(this.platform.is("ios")){
      this.settingsProvider.statusBar.backgroundColorByHexString('#ffffff');
    }else{
      this.settingsProvider.statusBar.backgroundColorByHexString('#000000');
    }
    const platform = this.navParams.get('platform') || null;
    if (platform){
      platform.registerBackButtonAction(() => {
        this.cancelButton();
      }, 0)
    }
  }
  cancelButton() {
    if (this.action != null){
      this.viewCtrl.dismiss('CLOSE');
    } else {
      this.viewCtrl.dismiss();
    }
  }

  chooseFromLibrary() {
    this.viewCtrl.dismiss('FROM_LIBRARY');
  }

  chooseFromCamera() {
    this.viewCtrl.dismiss('FROM_CAMERA');
  }
}
