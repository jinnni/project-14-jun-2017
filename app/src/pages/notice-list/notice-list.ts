import {Component} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ModalController,
  Platform
} from 'ionic-angular';
import {HttpService} from "../../services/httpService";
import {PreSurveyCampaignPage} from "../pre-survey-campaign/pre-survey-campaign";
import { SettingsProvider } from '../../providers/settingsProvider';
import {Util} from "../../global/util";
@IonicPage()
@Component({
  selector: 'page-notice-list',
  templateUrl: 'notice-list.html',
})
export class NoticeListPage {

  type: string;
  typeIcon: string;

  noticeList;
  notices: any;


  constructor(private navCtrl: NavController,
              public navParams: NavParams,
              public platform: Platform,
              private httpService: HttpService,
              private alertCtrl: AlertController,
              public modalCtrl: ModalController,
              private settingsProvider:SettingsProvider) {
    this.settingsProvider.isMenuOpened = false;
    this.type = navParams.get("type");
    this.typeIcon = navParams.get("icon");
    this.notices = [];

    if (this.type == "message") {
      this.getUserMessagesList("invitation");
    } else if (this.type == "delivery") {
      this.getUserMessagesList("box_tracking");
    } else {
      this.getUserMessagesList("other");
    }

  }
  ionViewWillEnter() {
    Util.unRegisterBackButton(this.platform, this.navCtrl)
  }
  openNotice(notice) {
    console.log(notice)
    if (notice.category == "invitation") {
      if (notice.status == 'read') {
        this.alertAlreadyCompleted();
      } else {
        this.httpService.ChangeMessageStatus(notice.category, "read", notice.id).subscribe(res => {
          this.httpService.GetCampaignById(notice.data).subscribe(res => {
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var dueDate = new Date(res.preSurveyDueDate);
            dueDate.setHours(0, 0, 0, 0);
            if (dueDate <= today) {
              // The Due Date is Over
              this.alertCtrl.create({
                title: "",
                message: "小问答已结束！",
                cssClass: 'okcancel',
                buttons: ["确定"]
            }).present();
            } else {
              // this.httpService.GetPreSurveyQuestion(notice.data).subscribe(res1 => {
              this.httpService.GetNextPresurveyQuestion(notice.data,'pre-survey').subscribe(res1 => {
                this.navCtrl.push(PreSurveyCampaignPage, {campData: res, from: 'pre-survey',preSurveyQuestion:res1});
              },eer=>{
                this.alertCtrl.create({
                  title: "",
                  message: "小问答已结束！",
                  cssClass: 'okcancel',
                  buttons: ["确定"]
              }).present();
              });
            }
          });
        });
      }
    } else {
      this.alertCtrl.create({
        title: "",
        message: "小问答已结束！",
        cssClass: 'okcancel',
        buttons: ["确定"]
    }).present();
    }
  }

  alertAlreadyCompleted() {
    let alert = this.alertCtrl.create({
      title: '恭喜恭喜，已完成启动！',
      message: '如最终被选的话你即将还会收到通知，感谢您的配合！',
      buttons: [
        {
          text: '确认',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  /*Message Of Notices*/
  getUserMessagesList(type: string) {
    this.httpService.GetUserMessagesList(type).subscribe(res => {
      this.notices = res;
      for (let item of this.notices) {
        if (item.status == "new") {
          this.httpService.ChangeMessageStatus(type, "unread", item.id).subscribe(res => {
          });
        }
      }
    });
  }
}
