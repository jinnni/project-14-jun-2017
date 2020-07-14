import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {ProfileMyQuestionPage} from './profile-my-question';
import {ProfileQnaItemModule} from "../../components/profile-qna-item/profile-qna-item.module";

@NgModule({
  declarations: [
    ProfileMyQuestionPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyQuestionPage),
    ProfileQnaItemModule
  ],
})
export class ProfileMyQuestionPageModule {
}
