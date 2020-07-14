
import { Camera } from '@ionic-native/camera';
import {AlertController} from "ionic-angular";
import {ImagePicker} from "@ionic-native/image-picker";
import {Subject} from "rxjs/Subject";
import {Injectable} from "@angular/core";
import {ImageResizer, ImageResizerOptions} from "@ionic-native/image-resizer";
import {Entry, File} from "@ionic-native/file";

declare let MediaPicker;
@Injectable()
export class LocalImageRetriever {

  imageSubject: Subject<string>;

  static maxImageSidePixel = 720;
  static imageResizeQuality = 50;

  constructor(private camera: Camera,
              private alertCtrl: AlertController,
              private imagePicker: ImagePicker,
              private imageResizer: ImageResizer,
              private file: File) {
    this.imageSubject = new Subject();
  }

  presentSetPicturePrompt(_title, _maximumCount = 1): Subject<string> {
    const prompt = this.alertCtrl.create({
      title: _title,
      buttons: [
        {
          text: "拍一张照片",
          handler: () => {
            console.log('take a picture');
            this.takePicture();
          }
        }, {
          text: "从相册中选择",
          handler: () => {
            console.log('go to gallery');
            this.pickImageFromGallery(_maximumCount);
          }
        }, {
          text: '取消',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });
    prompt.present();
    return this.imageSubject;
  }

  takePicture() {
    this.camera.getPicture({
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    }).then(fileUri => {
      this.handlePicture(fileUri);
    });
  }



  pickImageFromGallery(_maximumCount: number) {
    console.log("max count", _maximumCount);
   /* this.imagePicker.getPictures({
      maximumImagesCount: _maximumCount
    }).then(pictures => {
      pictures.forEach(
        picture => {
          this.handlePicture(picture);
        }
      );
    });*/
    var args = {
      'selectMode': 100, //101=picker image and video , 100=image , 102=video
      'maxSelectCount': _maximumCount, //default 40 (Optional)
      'maxSelectSize': 188743680, //188743680=180M (Optional)
    };
    MediaPicker.getMedias(args, (pictures) => {
      pictures.forEach(
        picture => {
          this.handlePicture(picture.uri);
        }
      );
    }, (e) => {
      console.log(e)
    })
  }



  handlePicture(fileUri: string) {
    // get image width and height
    this.getImageDimension(fileUri)
      .then(({width, height}) => {

        // just use the current one
        // if width and height of the image are both
        // no greater than max pixel
        if (width <= LocalImageRetriever.maxImageSidePixel
          && height <= LocalImageRetriever.maxImageSidePixel) {
          this.imageSubject.next(fileUri);
          return;
        }

        // set new smaller target dimension if it's not
        this.getNewImageDimension(width, height)
          .then(({newWidth, newHeight}) => {
            return this.resize(fileUri, newWidth, newHeight);
          })
          .then(resizedUri => {
            return this.separateDirPathAndFileName(resizedUri);
          })
          .then(({dirPath, fileName}) => {
            // move the resized image to cache dir
            return this.file.moveFile(dirPath, fileName,
              this.file.cacheDirectory, fileName);
          })
          .then((entry: Entry) => {
            console.log(entry.nativeURL);
            this.imageSubject.next(entry.nativeURL);

            // remove the original cache file
            this.removeFile(fileUri);
          })
          .catch(error => console.log(error));
      });
  }

  separateDirPathAndFileName(fileUri): Promise<{ dirPath: string, fileName: string }> {
    return new Promise((resolve, reject) => {
      // break down the components
      const lastSeparatorPos = fileUri.lastIndexOf("/");
      const dirPath = fileUri.substr(0, lastSeparatorPos + 1);
      const fileName = fileUri.substr(lastSeparatorPos + 1);

      resolve({
        dirPath: dirPath,
        fileName: fileName
      });
    });
  }

  getNewImageDimension(prevWidth: number, prevHeight: number): Promise<{ newWidth: number, newHeight: number }> {
    return new Promise((resolve, reject) => {
      // set new width, height
      let newWidth, newHeight;

      if (prevWidth > prevHeight) {
        newWidth = LocalImageRetriever.maxImageSidePixel;
        // get whole number
        newHeight = ~~(newWidth / prevWidth * prevHeight);
      }
      else {
        newHeight = LocalImageRetriever.maxImageSidePixel;
        newWidth = ~~(newHeight / prevHeight * prevWidth);
      }

      resolve({
        newWidth: newWidth,
        newHeight: newHeight
      });
    });
  }

  resize(fileUri: string, newWidth: number, newHeight: number): Promise<string> {
    //setup resizing option
    const option = {
      uri: fileUri,
      quality: LocalImageRetriever.imageResizeQuality,
      width: newWidth,
      height: newHeight
    } as ImageResizerOptions;

    // resize
    return this.imageResizer.resize(option);
  }

  getImageDimension(fileUri: string): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = fileUri;

      const poll = setInterval(() => {
        if (img.naturalWidth) {
          clearInterval(poll);
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight
          });
        }
      }, 10);
    });
  }

  removeFile(fileUri: string) {
    this.separateDirPathAndFileName(fileUri)
      .then(({dirPath, fileName}) => {
        return this.file.removeFile(dirPath, fileName);
      })
      .catch(error => console.log(error));
  }
}
