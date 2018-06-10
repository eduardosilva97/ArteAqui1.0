import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BuscareventosPage } from './buscareventos';

@NgModule({
  declarations: [
    BuscareventosPage,
  ],
  imports: [
    IonicPageModule.forChild(BuscareventosPage),
  ],
})
export class BuscareventosPageModule {}
