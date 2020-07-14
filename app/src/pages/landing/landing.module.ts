import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LandingPage } from './landing';
import { WebIntent } from '@ionic-native/web-intent';
@NgModule({
  declarations: [
    LandingPage,
    
  ],
  imports: [
    IonicPageModule.forChild(LandingPage),
  ],
  providers: [
    WebIntent
  ]
})
export class LandingPageModule {}
