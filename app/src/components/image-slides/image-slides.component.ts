import {Component, Input, OnInit} from '@angular/core';
import {NavController} from "ionic-angular";
import {UgcDetailPage} from "../../pages/ugc-detail/ugc-detail";
import {InAppBrowser, InAppBrowserOptions} from "@ionic-native/in-app-browser";
import {ProductDetailPage} from "../../pages/product-detail/product-detail";
import {HttpService} from "../../services/httpService";

@Component({
  selector: 'component-image-slides',
  templateUrl: 'image-slides.html',
})
export class ImageSlidesComponent implements OnInit {
  @Input() slideItems;

  constructor(private navCtrl: NavController,private iab: InAppBrowser,public UserService:HttpService) {
  }

  // @Input properties are available in onInit
  ngOnInit() {
  }

  showDetail(item) {
    switch (item.bannerType) {
      case "ARTICLE":
        this.navCtrl.push(UgcDetailPage, {
          id: item.articleId
        });
        break;
      case "UGC_ID":
        this.navCtrl.push(UgcDetailPage, {
          id: item.ugcId
        });
        break;
      case "ARTICLE_TIMELINE":
        this.navCtrl.push(UgcDetailPage, {
          id: item.articleTimelineId
        });
        break;
      case "URL_LINK":
        this.launch(item.linkUrl);
        break;
      case "PRODUCT_ID":
        break;
    }
  }

  launch(url : string){
    window.open(url,'_system','location=yes');
  }
}
