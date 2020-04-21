import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { ModalController, AlertController } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BackgroundGeolocation,
         BackgroundGeolocationConfig,
         BackgroundGeolocationResponse,
         BackgroundGeolocationEvents } from '@ionic-native/background-geolocation/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

import { MapaPage } from '../mapa/mapa.page';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {
  //
  map: any;
  address: string;
  cargando = false;
  enviando = false;
  iniciando = false;
  asistencia = [];
  caso = '';
  posData: any;
  //
  config: BackgroundGeolocationConfig = {
    desiredAccuracy: 10,
    stationaryRadius: 20,
    distanceFilter: 30,
    debug: false, //  enable this hear sounds for background-geolocation life-cycle.
    stopOnTerminate: false, // enable this to clear background location settings when the app terminates
  };
  //
  constructor( private funciones: FuncionesService,
               private datos: DatosService,
               private router: Router,
               private modalCtrl: ModalController,
               private alertCtrl: AlertController,
               private backgroundGeolocation: BackgroundGeolocation,
               private localNotifications: LocalNotifications,
               private geolocation: Geolocation ) {
    //
    this.backgroundGeolocation
        .configure(this.config)
        .then(() => {
          this.backgroundGeolocation.on( BackgroundGeolocationEvents.location )
          .subscribe((location: BackgroundGeolocationResponse) => {
              // console.log(location);
              this.showNotification(location);
              // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
              // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
              // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
              this.backgroundGeolocation.finish(); // FOR IOS ONLY
          });
        });
  }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
      this.leerMisAsistencias();
  }
  ionViewWillLeave() {
    this.backgroundGeolocation.stop();
  }

  doRefresh( event ) {
    this.leerMisAsistencias( event );
  }

  leerMisAsistencias( event? ) {
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
    this.iniciando = true;
    this.caso = caso;
    this.backgroundGeolocation.start();
  }

  showNotification(data) {
    // Schedule a single notification
    console.log('showNotification()', data );
    this.iniciando = false;
    this.posData = data;
    this.guardarPos( this.caso );
    // this.localNotifications.schedule({
      //   id: 1,
      //   text: JSON.stringify(data),
      //   // sound: 'file://sound.mp3',
      //   data: { secret: 'key' }
      // });
  }

  async guardarPos( caso ) {
    const texto = `Confirmo que estoy ${ this.caso === 'I' ? 'haciendo ingreso a' : 'saliendo de' } mi lugar de trabajo.`;
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
               this.registrarCaso( this.caso, this.posData.latitude, this.posData.longitude );
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
    console.log(dev);
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
