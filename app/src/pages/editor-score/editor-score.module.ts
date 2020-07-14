import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditorScorePage } from './editor-score';

@NgModule({
  declarations: [
    EditorScorePage,
  ],
  imports: [
    IonicPageModule.forChild(EditorScorePage),
  ],
})
export class EditorScorePageModule {}
