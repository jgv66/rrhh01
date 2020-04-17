import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AsistenciaPage } from './asistencia.page';

import { MapaPage } from '../mapa/mapa.page';
import { MapaPageModule } from '../mapa/mapa.module';

const routes: Routes = [
  {
    path: '',
    component: AsistenciaPage
  }
];

@NgModule({
  entryComponents: [ MapaPage ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapaPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AsistenciaPage]
})
export class AsistenciaPageModule {}
