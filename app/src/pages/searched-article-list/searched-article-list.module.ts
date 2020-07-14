import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchedArticleListPage } from './searched-article-list';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    SearchedArticleListPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchedArticleListPage),
    IonicImageLoader
  ],
})
export class SearchedArticleListPageModule {}
