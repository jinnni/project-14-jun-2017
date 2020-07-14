import {Component} from '@angular/core';
import {IonicPage, NavController, Platform} from 'ionic-angular';
import {ProfileSettingsFaqDetailPage} from "../profile-settings-faq-detail/profile-settings-faq-detail";
import { Util } from "../../global/util";
import { SettingsProvider } from '../../providers/settingsProvider';
@IonicPage()
@Component({
  selector: 'page-profile-settings-faq',
  templateUrl: 'profile-settings-faq.html',
})
export class ProfileSettingsFaqPage {

  menuItems = [
    {
      key: "how-to-start",
      title: "如何开始",
      icon: "assets/img/faq/map.png",
      qna: [
        {
          question: "什么是评价达人？",
          answer: "评价达人是国内第一个发现和评价产品的平台，消费者交换宝贵的使用心得就能免费获得产品体验和服务噢！"
        },
        {
          question: "如何注册评价达人？",
          answer: "评价达人是国内第一个发现和评价产品的平台，消费者交换宝贵的使用心得就能免费获得产品体验和服务噢！"
        },
        {
          question: "成为评价达人的一员需要费用吗？",
          answer: "评价达人是国内第一个发现和评价产品的平台，消费者交换宝贵的使用心得就能免费获得产品体验和服务噢！"
        },
        {
          question: "如何参与社区互动？",
          answer: "评价达人是国内第一个发现和评价产品的平台，消费者交换宝贵的使用心得就能免费获得产品体验和服务噢！"
        }
      ]
    },
    {
      key: "activity",
      title: "活动, 宝 BOX & 邀请",
      icon: "assets/img/faq/box.png",
    },
    {
      key: "qualification",
      title: "宝 BOX & 活动资格",
      icon: "assets/img/faq/check_mark.png",
    },
    {
      key: "life-style-badge",
      title: "生活方式勋章和专家勋章",
      icon: "assets/img/faq/life_style_badge.png",
    },
    {
      key: "activity-badge",
      title: "活动勋章",
      icon: "assets/img/faq/activity_badge.png",
    },
    {
      key: "mission",
      title: "任务",
      icon: "assets/img/faq/smile.png",
    },
    {
      key: "delivery",
      title: "宝 BOX 配送",
      icon: "assets/img/faq/delivery.png",
    },
    {
      key: "virtual-gift",
      title: "虚拟宝",
      icon: "assets/img/faq/virtual.png",
    },
    {
      key: "review",
      title: "关于评价",
      icon: "assets/img/faq/write_review.png",
    },
    {
      key: "social-impact",
      title: "社会影响力",
      icon: "assets/img/faq/sound.png",
    },
    {
      key: "list",
      title: "列表",
      icon: "assets/img/faq/list.png",
    },
    {
      key: "code-of-conduct",
      title: "行为准则",
      icon: "assets/img/faq/hammer.png",
    }
  ];

  constructor(public navCtrl: NavController,public platform: Platform,
    private settingsProvider:SettingsProvider) {
  }

  onClickMenuItem(item) {
    this.navCtrl.push(ProfileSettingsFaqDetailPage, item);
  }
  ionViewWillLeave(){
    if(this.navCtrl.getPrevious() != null){
      let prevPage = this.navCtrl.getPrevious();
      this.settingsProvider.productSlider.startAutoplay();
      if(prevPage.component.name == "TimeLinePage" || (prevPage.component.name == "LandingPage" && prevPage.instance.isTimelinePage)){
        if(this.settingsProvider.showSearch){
          this.settingsProvider.slider.stopAutoplay();
          this.settingsProvider.statusBar.backgroundColorByHexString('#ff2744');
        }else{
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
    Util.unRegisterBackButton(this.platform,this.navCtrl)
  }

}
