import {NgModule} from "@angular/core";
import {IonicModule, IonicPageModule} from "ionic-angular";
import {ProfileQnaItemComponent} from "./profile-qna-item";

@NgModule({
  declarations: [
    ProfileQnaItemComponent
  ],
  imports: [
    IonicPageModule.forChild(ProfileQnaItemComponent)
  ],
  exports: [
    ProfileQnaItemComponent
  ]
})
export class ProfileQnaItemModule {
}
