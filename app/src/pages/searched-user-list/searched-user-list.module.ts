import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchedUserListPage } from './searched-user-list';

@NgModule({
  declarations: [
    SearchedUserListPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchedUserListPage),
  ],
})
export class SearchedUserListPageModule {}
