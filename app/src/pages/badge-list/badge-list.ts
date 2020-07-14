import {Component} from '@angular/core';
import {Badge} from "../../data/badge.interface";
import {HttpService} from "../../services/httpService";
import {IonicPage, NavController, Platform} from "ionic-angular";
import {BadgeDetailPage} from "../badge-detail/badge-detail";
import { Util }  from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';

@IonicPage({
  segment: "badges"
})
@Component({
  selector: 'page-badge-list',
  templateUrl: 'badge-list.html',
})
export class BadgeListPage {

  selectedBadgeType: number = 1;

  expertBadgeList: any;
  lifeStyleBadgeList: any;
  imageUrl: string;

  constructor(private httpService: HttpService,
              public platform:Platform,
              private settingsProvider:SettingsProvider,
              private navCtrl: NavController) {
    this.expertBadgeList = this.getBadgeListByType('expert');
    this.lifeStyleBadgeList = this.getBadgeListByType('life_style');
    this.imageUrl = localStorage.getItem("myImageUrl");
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
    Util.unRegisterBackButton(this.platform,this.navCtrl);
  }

  getBadgeListByType(type:string){
    if(type == "expert"){
      this.httpService.GetBadgeListByType(1).subscribe(res =>{
        this.expertBadgeList = res;
      });
    }else{
      this.httpService.GetBadgeListByType(2).subscribe(res =>{
        this.lifeStyleBadgeList =res;
      });
    }
  }

  selectBadgeType(typeNumber: number) {
    this.selectedBadgeType = typeNumber;
  }

  showBadge(badge: Badge) {
    this.navCtrl.push(BadgeDetailPage, {
      id: badge.id
    });
  }
}
