import {Component} from '@angular/core';
import {Config, Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {InitialPage} from "../pages/initial/initial";
import {Deeplinks} from '@ionic-native/deeplinks';
import {ImageLoaderConfig} from 'ionic-image-loader';
import {ENV} from '@app/env';
import { NotificationService } from '../services/notificationService';
import { setInterval } from 'timers';
import { WebIntent } from '@ionic-native/web-intent';
import { LandingPage } from '../pages/landing/landing';


declare let PjPlugin:any;
declare let window: any;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = InitialPage;
// ionic cordova build ios -- --buildFlag="-UseModernBuildSystem=0"
  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public deeplinks: Deeplinks,
    imageLoaderConfig: ImageLoaderConfig,
    public notificationService: NotificationService,
    private config: Config) {

      
      if (this.platform.is("cordova")) {
        platform.ready().then(() => {
        splashScreen.hide();
  

        if (this.platform.is("ios")) {
          this.statusBar.overlaysWebView(false);
          this.statusBar.styleDefault();
        } else {
          this.statusBar.backgroundColorByHexString("#33000000");
          statusBar.show();
        }

        imageLoaderConfig.enableFallbackAsPlaceholder(true);
        imageLoaderConfig.setFallbackUrl('assets/img/placeholder.png');
        /*Gloable URL for Image Loading*/
        localStorage.setItem("myImageUrl", ENV.imageUrl);
        if (this.platform.is('android')) {
          this.config.set('mode', 'md');
          this.config.set('backButtonIcon', 'ios-arrow-back');

        }
      });
    }else{
      localStorage.setItem("myImageUrl", ENV.imageUrl);
    }
  }
}

/*Deeplinking Code*/
/*
this.deeplinks.route({
   '/initial': InitialPage,
 }).subscribe((match) => {
   alert(JSON.stringify(match));
 }, (nomatch) => {
   alert(JSON.stringify(nomatch));
 });
 */
