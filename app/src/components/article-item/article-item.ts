import {Component, Input} from '@angular/core';
import {Util} from "../../global/util";
import {Article} from "../../data/article.interface";
import {ArticlePage} from "../../pages/article/article";
import {NavController} from "ionic-angular";

@Component({
  selector: 'article-item',
  templateUrl: 'article-item.html'
})
export class ArticleItemComponent {

  util = Util;

  @Input()
  articleData: Article;

  constructor(private navCtrl: NavController) {
  }

  showArticle() {
    this.navCtrl.push(ArticlePage, {
      id: this.articleData.id
    });
  }

  share($event) {
    $event.stopPropagation();
    console.log("share article");
  }

  follow($event) {
    $event.stopPropagation();
    console.log("follow article writer");
  }
}
