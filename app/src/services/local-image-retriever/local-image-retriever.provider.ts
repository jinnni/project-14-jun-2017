import {NgModule} from '@angular/core';
import {Camera} from "@ionic-native/camera";
import {ImagePicker} from "@ionic-native/image-picker";
import {LocalImageRetriever} from "./local-image-retriever";
import {ImageResizer} from "@ionic-native/image-resizer";
import {File} from "@ionic-native/file";

@NgModule({
  providers: [
    LocalImageRetriever,
    Camera,
    ImagePicker,
    ImageResizer,
    File
  ]
})
export class LocalImageRetrieverProvider {
}
