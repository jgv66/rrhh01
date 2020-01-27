import { Component, OnInit, Input } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ModalController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-pdfview',
  templateUrl: './pdfview.page.html',
  styleUrls: ['./pdfview.page.scss'],
})
export class PdfviewPage implements OnInit {

  @Input() pdf;
  @Input() periodo;
  @Input() email;
  pdfEnServer;
  enviando = false;
  enviarCorreo = false;
  subject = '';
  copia = '';

  constructor( private pdfviewer: PdfViewerModule,
               private modalCtrl: ModalController,
               private funciones: FuncionesService,
               private datos: DatosService ) {}

  ngOnInit() {
    // console.log( this.pdf, this.periodo );
    this.pdfEnServer = this.datos.url + '/static/pdf/' + this.pdf;
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  prepararEmail() {
    this.enviarCorreo = true;
  }

  sendEmail() {
   console.log( this.email, this.subject, this.copia );
   if ( this.email === '' ) {
    this.funciones.msgAlert( 'ATENCION', 'El correo es obligatorio para enviar copias de su liquidación en formato estandar PDF. Corrija y reintente.' );
   } else {
    this.enviando = true;
    this.datos.servicioWEB( '/enviarPDF', { to: this.email,
                                            cc: this.copia,
                                            subject: this.subject,
                                            filename: this.pdf,
                                            nombres: this.datos.nombre,
                                            codigo: this.datos.ficha,
                                            periodo: this.periodo } )
    .subscribe( dev => { this.enviando = false;
                         this.revisaRespuesta( dev ); } );
   }
  }
  revisaRespuesta( dev ) {
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje );
    } else {
      this.funciones.msgAlert( 'ATENCION', 'El email fue enviado con exito.' + dev.mensaje );
    }
  }

}
