import { Component, OnInit, Input } from '@angular/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ModalController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

const ZOOM_STEP     = 1;
const DEFAULT_ZOOM  = 1;

@Component({
  selector: 'app-pdfview',
  templateUrl: './pdfview.page.html',
  styleUrls: ['./pdfview.page.scss'],
})
export class PdfviewPage implements OnInit {

  @Input() pdf;
  @Input() periodo;
  @Input() email;
  @Input() desde;
  pdfEnServer;
  enviando = false;
  enviarCorreo = false;
  subject = '';
  copia = '';
  // -------------------------
  pdfZoom = DEFAULT_ZOOM;

  constructor( private pdfviewer: PdfViewerModule,
               private modalCtrl: ModalController,
               private funciones: FuncionesService,
               private datos: DatosService ) {}

  ngOnInit() {
    this.pdfEnServer = this.datos.url + '/static/pdf/' + this.pdf;
    this.desde = (this.desde === '' || this.desde === undefined) ? '' : this.desde;
    // console.log( 'PdfviewPage ->', this.pdfEnServer );
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  prepararEmail() {
    this.enviarCorreo = true;
  }

  sendEmail() {
   // console.log( this.email, this.subject, this.copia );
   if ( this.email === '' ) {
    this.funciones.msgAlert( 'ATENCION', 'El correo es obligatorio para enviar copias de su liquidación en formato estandar PDF. Corrija y reintente.' );
   } else {
    this.enviando = true;
    this.datos.servicioWEB( '/enviarPDF', { to: this.email,
                                            cc: this.copia,
                                            desde: this.desde,
                                            subject: (this.subject === '' || this.subject === undefined) ? this.desde : this.subject,
                                            filename: this.pdf,
                                            nombres: this.datos.nombre,
                                            codigo: this.datos.ficha,
                                            periodo: this.periodo,
                                            ficha: this.datos.ficha,
                                            empresa: this.datos.idempresa } )
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

  zoomIn() {
    this.pdfZoom += ZOOM_STEP;
  }

  zoomOut() {
    if (this.pdfZoom > DEFAULT_ZOOM) {
      this.pdfZoom -= ZOOM_STEP;
    }
  }

  resetZoom()	{
    this.pdfZoom = DEFAULT_ZOOM;
  }

}
