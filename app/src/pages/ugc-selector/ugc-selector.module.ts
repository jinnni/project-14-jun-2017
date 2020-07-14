import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UgcSelectorPage } from './ugc-selector';

@NgModule({
  declarations: [
    UgcSelectorPage,
  ],
  imports: [
    IonicPageModule.forChild(UgcSelectorPage),
  ],
})
export class UgcSelectorPageModule {}
