import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalhaPage } from './detalhaevento';

@NgModule({
  declarations: [
    DetalhaPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalhaPage),
  ],
})
export class DetalhaeventoPageModule {}
