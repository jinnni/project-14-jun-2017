import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchListPage } from './search-list';
import { SearchBarHeaderModule } from '../../components/search-bar-header/search-bar-header.module';

@NgModule({
  declarations: [
    SearchListPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchListPage),
    SearchBarHeaderModule
  ],
})
export class SearchListPageModule {}
