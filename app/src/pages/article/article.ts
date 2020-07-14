import {Component} from '@angular/core';
import {IonicPage, NavParams, Platform, NavController} from 'ionic-angular';
import {CommentPage} from "../comment/comment";
import articles from "../../data/articles";
import { Util } from "../../global/util";
import {Article} from "../../data/article.interface";


@IonicPage({
  segment: "article/:id"
})
@Component({
  selector: 'page-article',
  templateUrl: 'article.html'
})
export class ArticlePage {

  commentPage = CommentPage;

  articles: Array<Article> = articles;

  articleData;

  constructor(public navParams: NavParams,public platform:Platform,public navCtrl:NavController) {
    const articleId = navParams.get("id");
    this.articleData = this.articles.find(article => {
      return article.id == articleId;
    });

    // if no article exists on given id
    if (!this.articleData) {
      // handle 404
      throw new Error("no article found on given id");
    }
  }
  ionViewWillEnter(){
    Util.unRegisterBackButton(this.platform,this.navCtrl);
  }
}
