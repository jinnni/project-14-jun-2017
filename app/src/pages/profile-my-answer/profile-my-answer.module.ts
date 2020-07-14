import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileMyAnswerPage } from './profile-my-answer';
import {ProfileQnaItemModule} from "../../components/profile-qna-item/profile-qna-item.module";

@NgModule({
  declarations: [
    ProfileMyAnswerPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMyAnswerPage),
    ProfileQnaItemModule
  ],
})
export class ProfileMyAnswerPageModule {}
