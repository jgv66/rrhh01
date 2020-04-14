import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { PdfviewPage } from '../pdfview/pdfview.page';

@Component({
  selector: 'app-misliq',
  templateUrl: './misliq.page.html',
  styleUrls: ['./misliq.page.scss'],
})

export class MisliqPage implements OnInit {

  cargando = false;
  inner = false;
  liquidaciones = [];

  constructor( public datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
    this.cargando = true;
    this.datos.servicioWEB( '/liquidaciones', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', 'No existen liquidaciones para rescatar y deslegar.' );
            } else {
              this.liquidaciones = dev.datos;
            }
        },
        (error) => {
          this.funciones.msgAlert( 'ATENCION', error );
        });
  }

  buscarPDF( item ) {
    item.descargando = true;
    this.datos.servicioWEB( '/leerPDFLiquidacion', { ficha: this.datos.ficha, idpdf: item.id_pdf, filename: item.filename, empresa: this.datos.idempresa } )
        .subscribe( dev => { item.descargando = false;
                             this.revisaRespuesta( dev, item.periodo ); } );
  }
  revisaRespuesta( dev, periodo ) {
    this.cargando = false;
    // console.log( dev );
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev[0].datos );
    } else {
      // asigna el dato obtenido
      this.verPdf( dev, periodo );
      //
    }
  }

  async verPdf( dev, peri ) {
    const modal = await this.modalCtrl.create({
      component: PdfviewPage,
      componentProps: { pdf: dev.datos,
                        periodo: peri,
                        email: this.datos.email,
                        desde: 'Mi liquidación de ' + peri }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    // console.log( data );
  }

}
