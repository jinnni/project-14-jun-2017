import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import {AppMinimize} from "@ionic-native/app-minimize";
import { MyApp } from './app.component';
import { InitialPageModule } from "../pages/initial/initial.module";
import { HttpModule } from "@angular/http";
import { HttpService } from "../services/httpService";
import { IonicStorageModule } from "@ionic/storage";
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { Deeplinks } from '@ionic-native/deeplinks';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SafariViewController } from '@ionic-native/safari-view-controller';
import { Clipboard } from '@ionic-native/clipboard';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { ImagePicker } from '@ionic-native/image-picker';
import { ImageResizer } from '@ionic-native/image-resizer';
import { IonicImageLoader } from 'ionic-image-loader';
import { NativePageTransitions } from '@ionic-native/native-page-transitions';
import { Crop } from '@ionic-native/crop';
import {AppVersion} from "@ionic-native/app-version";
import {Market} from "@ionic-native/market";
import {WebView} from '@ionic-native/ionic-webview/ngx';

import { NotificationService } from '../services/notificationService';

import { LandingPage } from '../pages/landing/landing';
import { PhotoLibrary } from '@ionic-native/photo-library';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      platforms:{
        ios:{
          scrollAssist: true,
          autoFocusAssist: true,
          scrollPadding: false,
        }
      },
      links: [
        { component: LandingPage, name: 'LandingPage', segment: 'landing' }
      ],
      tabSubPages:false,
      statusbarPadding: true,
      scrollPadding: true,
      scrollAssist:true,
      autoFocusAssist: true,
      tabsPlacement: 'bottom',
      tabsHideOnSubPages: true}),
    InitialPageModule,
    HttpModule,
    IonicImageLoader.forRoot(),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    HttpService,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    FileTransfer,
    FileTransferObject,
    File,
    Network,
    Deeplinks,
    InAppBrowser,
    SafariViewController,
    Clipboard,
    AndroidPermissions,
    ImagePicker,
    Crop,
    NotificationService,
    AppMinimize,
    ImageResizer,WebView,
    NativePageTransitions,AppVersion,Market,
    PhotoLibrary
  ]
})
export class AppModule {
}
