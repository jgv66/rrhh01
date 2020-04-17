import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';

import { Geolocation, Geoposition } from '@ionic-native/geolocation/ngx';

import { MapaPage } from '../mapa/mapa.page';
// declare var google;

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {

  // @ViewChild( 'map', {static: false}) mapElement: ElementRef;
  map: any;
  address: string;

  // googleMapKey = 'AIzaSyDSPDpkFznGgzzBSsYvTq_sj0T0QCHRgwM';

  cargando = false;
  enviando = false;
  asistencia = [];

  constructor( private funciones: FuncionesService,
               private datos: DatosService,
               private router: Router,
               private modalCtrl: ModalController,
               private alertCtrl: AlertController,
               private geolocation: Geolocation ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
    this.leerMisAsistencias();
  }

  doRefresh( event ) {
    this.leerMisAsistencias( event );
  }

  leerMisAsistencias( event? ) {
    console.log( {ficha: this.datos.ficha, empresa: this.datos.idempresa} );
    this.cargando = true;
    this.datos.servicioWEB( '/leerGeoPos', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( dev => this.revisaResp( dev, event ) );
  }
  revisaResp( dev, event ) {
    console.log(dev);
    this.cargando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else if ( dev.resultado === 'nodata' ) {
      this.funciones.msgAlert( 'ATENCION', 'Su registro de asistencias está vacío.' );
    } else if ( dev.resultado === 'ok' ) {      // asigna el dato obtenido
      this.asistencia = dev.datos;
      if ( event ) {
        event.target.complete();
      }
      if ( this.asistencia.length === 0 ) {
        this.funciones.msgAlert( 'ATENCION', 'No existen registros de asistencia para mostrar' );
      }
      //
    }
  }

  ubicame( caso ) {
    //
    const options = {
      maximumAge: 3000,
      enableHighAccuracy: true
    };
    //
    this.geolocation.getCurrentPosition( options )
        .then((resp) => {
          //
          console.log(caso, resp.coords.latitude, resp.coords.longitude);
          this.guardarPos( caso, resp.coords.latitude, resp.coords.longitude );
          //
        }).catch((error) => {
          console.log('Error getting location', error);
        });
  }

  async guardarPos( caso, lat, lng ) {
    const texto = `Confirmo que estoy ${ caso === 'I' ? 'haciendo ingreso a' : 'saliendo de' } mi lugar de trabajo.`;
    const alert = await this.alertCtrl.create({
      header: 'ATENCION',
      message: texto,
      buttons: [
        {
          text: 'NO, cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Sí, aceptar',
          handler: () => {
               this.registrarCaso( caso, lat, lng );
          }
        }
      ]
    });
    await alert.present();
  }

  registrarCaso( caso, lat, lng ) {
    this.enviando = true;
    this.datos.servicioWEB( '/guardaGeoPos', { ficha: this.datos.ficha, empresa: this.datos.idempresa, io: caso, lat, lng } )
        .subscribe( dev => this.revisaRespuesta( dev ) );
  }
  revisaRespuesta( dev ) {
    console.log(dev)
    this.enviando = false;
    //
    if ( dev.resultado === 'ok' ) {
      this.funciones.muestraySale( dev.datos[0].mensaje, 2, 'middle' );
      this.router.navigate(['/home']);
    } else {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'REINTENTE LUEGO' );
    }
    //
  }

  async verUbicacion( item ) {
    const modal = await this.modalCtrl.create({
      component: MapaPage,
      componentProps: { item }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    // console.log( data );
  }

}
