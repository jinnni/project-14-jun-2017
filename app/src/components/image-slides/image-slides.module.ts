import {NgModule} from "@angular/core";
import {ImageSlidesComponent} from "./image-slides.component";
import {IonicModule, IonicPageModule} from "ionic-angular";
import { IonicImageLoader } from "ionic-image-loader";

@NgModule({
  declarations: [
    ImageSlidesComponent
  ],
  imports: [
    IonicPageModule.forChild(ImageSlidesComponent),
    IonicImageLoader
  ],
  exports: [
    ImageSlidesComponent
  ]
})
export class ImageSlidesModule {

}
