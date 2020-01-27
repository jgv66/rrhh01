import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PdfViewerModule } from 'ng2-pdf-viewer';

import { IonicModule } from '@ionic/angular';
import { PdfviewPage } from './pdfview.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PdfViewerModule
  ],
  declarations: [PdfviewPage]
})
export class PdfviewPageModule {}
