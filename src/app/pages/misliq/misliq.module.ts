import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { MisliqPage } from './misliq.page';

import { PdfviewPage } from '../pdfview/pdfview.page';
import { PdfviewPageModule } from '../pdfview/pdfview.module';

const routes: Routes = [
  {
    path: '',
    component: MisliqPage
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
  declarations: [MisliqPage]
})
export class MisliqPageModule {}
