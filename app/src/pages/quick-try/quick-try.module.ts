import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QuickTryPage } from './quick-try';

@NgModule({
  declarations: [
    QuickTryPage,
  ],
  imports: [
    IonicPageModule.forChild(QuickTryPage),
  ],
})
export class QuickTryPageModule {}
