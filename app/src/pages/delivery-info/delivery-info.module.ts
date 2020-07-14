import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeliveryInfoPage } from './delivery-info';

@NgModule({
  declarations: [
    DeliveryInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(DeliveryInfoPage),
  ],
})
export class DeliveryInfoPageModule {}
