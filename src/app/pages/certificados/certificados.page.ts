import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FuncionesService } from '../../services/funciones.service';
import { DatosService } from '../../services/datos.service';
import { ModalController } from '@ionic/angular';
import { PdfviewPage } from '../pdfview/pdfview.page';

@Component({
  selector: 'app-certificados',
  templateUrl: './certificados.page.html',
  styleUrls: ['./certificados.page.scss'],
})
export class CertificadosPage implements OnInit {

  cargando = false;

  constructor( private funciones: FuncionesService,
               private datos: DatosService,
               private router: Router,
               private modalCtrl: ModalController ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }

  antiguedad() {
    // console.log('antiguedad');
    this.cargando = true;
    this.datos.servicioWEB( '/leerCertAntiguedad', { key: 'CERT-ANTIG', ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( ( dev: any ) => {
            this.cargando = false;
            // console.log( dev );
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( dev.datos.code, dev.datos.name );
            } else {
              // 
              this.verPdf( dev );
              //
            }
        });
  }

  async verPdf( dev ) {
    const modal = await this.modalCtrl.create({
      component: PdfviewPage,
      componentProps: { pdf: dev.datos,
                        periodo: 'Certif. de Antiguedad',
                        desde: 'Certif. de Antiguedad',
                        email: this.datos.email }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    // console.log( data );
  }

  renta() {
    this.funciones.msgAlert( 'ATENCION', 'En construcción' );
  }


}
