import {Component, Input} from '@angular/core';
import {NavController} from "ionic-angular";
import {CampaignBadgeIntroPage} from "../../campaign-badge-intro/campaign-badge-intro";
import {CampaignBadgeListPage} from "../../campaign-badge-list/campaign-badge-list";
import {Util} from "../../../global/util";

@Component({
  selector: 'campaign-item',
  templateUrl: 'campaign-item.html'
})
export class CampaignItemComponent {
  @Input() campaignData;

  util = Util;

  campaignBadges = [
    {
      id: 1,
      campaignId: 1,
      title: "tonymoly",
      image: "assets/img/badges/tonymoly_badge.png",
      description: "收到了看风景卢卡斯的浪费空间啦克拉科夫啊来开发建设立刻" +
      "搭街坊立刻集散地立刻发说了看见了看见分厘卡的就是" +
      "搭街坊立刻集散地立刻发说了看见了看见分厘卡的就是" +
      "收到了看风景卢卡斯的浪费空间啦克拉科夫啊来开发建设立刻",
      detail: "html contents",
      dueDate: new Date(2017, 9, 29),
      introImage: "assets/img/campaigns/tonymoly.jpg",
      knowMoreTitle: "TONYMOLY",
      knowMoreContent: `<p>Hello, this is a html content</p><p><span style="color: #ff0000;">this is a red text&nbsp;<img src="https://html-online.com/editor/tinymce4_6_5/plugins/emoticons/img/smiley-smile.gif" alt="smile"/></span></p><p><span style="color: #3366ff;">this is a blue text</span></p><p>below is a picture</p><p><img src="http://m1.daumcdn.net/svc/image/U03/common_icon/52E1CEEA0379830003" alt="" width="80" height="32"/></p><ul><li><h3>This is a bigger text</h3></li><li><strong>this is a bold text</strong></li><li><em>this is a italic text</em></li></ul><table><tbody><tr><td><strong>1</strong></td><td><strong>2</strong></td><td><strong>3</strong></td></tr><tr><td>this</td><td>is</td><td>table</td></tr><tr><td>you</td><td>can</td><td>also</td></tr><tr><td>write</td><td>a</td><td>table</td></tr><tr><td>with</td><td>wysiwyg</td><td>web editor</td></tr></tbody></table>`
    },
    {
      id: 2,
      campaignId: 2,
      title: "tonymoly",
      image: "assets/img/badges/tonymoly_badge.png",
      description: "收到了看风景卢卡斯的浪费空间啦克拉科夫啊来开发建设立刻搭街坊立刻集散地立刻发说了看见了看见分厘卡的就是",
      detail: "html contents",
      introImage: "assets/img/campaigns/tonymoly.jpg",
      knowMoreTitle: "TONYMOLY",
      knowMoreContent: "html content goes here"
    },
    {
      id: 3,
      campaignId: 2,
      title: "tonymoly",
      image: "assets/img/badges/tonymoly_badge.png",
      description: "收到了看风景卢卡斯的浪费空间啦克拉科夫啊来开发建设立刻搭街坊立刻集散地立刻发说了看见了看见分厘卡的就是",
      detail: "html contents",
      introImage: "assets/img/campaigns/tonymoly.jpg",
      knowMoreTitle: "TONYMOLY",
      knowMoreContent: "html content goes here"
    },
    {
      id: 4,
      campaignId: 2,
      title: "tonymoly",
      image: "assets/img/badges/tonymoly_badge.png",
      description: "收到了看风景卢卡斯的浪费空间啦克拉科夫啊来开发建设立刻搭街坊立刻集散地立刻发说了看见了看见分厘卡的就是",
      detail: "html contents",
      introImage: "assets/img/campaigns/tonymoly.jpg",
      knowMoreTitle: "TONYMOLY",
      knowMoreContent: "html content goes here"
    },
    {
      id: 5,
      campaignId: 2,
      title: "tonymoly",
      image: "assets/img/badges/tonymoly_badge.png",
      description: "收到了看风景卢卡斯的浪费空间啦克拉科夫啊来开发建设立刻搭街坊立刻集散地立刻发说了看见了看见分厘卡的就是",
      detail: "html contents",
      introImage: "assets/img/campaigns/tonymoly.jpg",
      knowMoreTitle: "TONYMOLY",
      knowMoreContent: `<p>Hello, this is a html content</p><p><span style="color: #ff0000;">this is a red text&nbsp;<img src="https://html-online.com/editor/tinymce4_6_5/plugins/emoticons/img/smiley-smile.gif" alt="smile"/></span></p><p><span style="color: #3366ff;">this is a blue text</span></p><p>below is a picture</p><p><img src="http://m1.daumcdn.net/svc/image/U03/common_icon/52E1CEEA0379830003" alt="" width="80" height="32"/></p><ul><li><h3>This is a bigger text</h3></li><li><strong>this is a bold text</strong></li><li><em>this is a italic text</em></li></ul><table><tbody><tr><td><strong>1</strong></td><td><strong>2</strong></td><td><strong>3</strong></td></tr><tr><td>this</td><td>is</td><td>table</td></tr><tr><td>you</td><td>can</td><td>also</td></tr><tr><td>write</td><td>a</td><td>table</td></tr><tr><td>with</td><td>wysiwyg</td><td>web editor</td></tr></tbody></table>`
    }
  ];

  constructor(private navCtrl: NavController) {
  }



  seeBadges() {
    // get badge list from server with the campaign id
    const badgeList = this.campaignBadges.filter(badge => {
      return badge.campaignId == this.campaignData.id;
    });


    if (!badgeList || badgeList.length <= 0) {
      return;
    }

    if (badgeList.length == 1) {
      this.navCtrl.push(CampaignBadgeIntroPage, badgeList[0]);
      return;
    }

    // if there's more than one badge
    this.navCtrl.push(CampaignBadgeListPage, {
      campaignName: this.campaignData.title,
      badgeList: badgeList
    });
  }
}
