import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchedUgcListPage } from './searched-ugc-list';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    SearchedUgcListPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchedUgcListPage),
    IonicImageLoader
  ],
})
export class SearchedUgcListPageModule {}
