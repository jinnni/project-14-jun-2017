import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {SurveyIntroPage} from './survey-intro';
import {SurveyPageModule} from "../survey/survey.module";

@NgModule({
  declarations: [
    SurveyIntroPage,
  ],
  imports: [
    IonicPageModule.forChild(SurveyIntroPage),
    SurveyPageModule
  ],
})
export class SurveyIntroPageModule {
}
