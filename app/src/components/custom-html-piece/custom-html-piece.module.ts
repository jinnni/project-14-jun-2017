import {NgModule} from "@angular/core";
import {IonicModule, IonicPageModule} from "ionic-angular";
import {CustomHtmlPieceComponent} from "./custom-html-piece";

@NgModule({
  declarations: [
    CustomHtmlPieceComponent
  ],
  imports: [
    IonicPageModule.forChild(CustomHtmlPieceComponent)
  ],
  exports: [
    CustomHtmlPieceComponent
  ]
})
export class CustomHtmlPieceModule {
}
