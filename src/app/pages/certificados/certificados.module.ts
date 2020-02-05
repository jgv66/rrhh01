import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { CertificadosPage } from './certificados.page';

import { PdfviewPage } from '../pdfview/pdfview.page';
import { PdfviewPageModule } from '../pdfview/pdfview.module';

const routes: Routes = [
  {
    path: '',
    component: CertificadosPage
  }
];

@NgModule({
  entryComponents: [ PdfviewPage ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PdfviewPageModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CertificadosPage]
})
export class CertificadosPageModule {}
