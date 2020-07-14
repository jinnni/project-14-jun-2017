import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomHtmlPage } from './custom-html';
import {CustomHtmlPieceModule} from "../../components/custom-html-piece/custom-html-piece.module";

@NgModule({
  declarations: [
    CustomHtmlPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomHtmlPage),
    CustomHtmlPieceModule
  ],
})
export class CustomHtmlPageModule {}
