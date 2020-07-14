import {NgModule} from "@angular/core";
import {IonicModule, IonicPageModule} from "ionic-angular";
import {TwoWayUgcListComponent} from "./two-way-ugc-list.component";
import {UgcItemComponent} from "../ugc-item/ugc-item.component";

@NgModule({
  declarations: [
    TwoWayUgcListComponent,
    UgcItemComponent
  ],
  imports: [
    IonicPageModule.forChild(TwoWayUgcListComponent)
  ],
  exports: [
    TwoWayUgcListComponent
  ]
})
export class TwoWayUgcListModule {

}
