import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-miscom',
  templateUrl: './miscom.page.html',
  styleUrls: ['./miscom.page.scss'],
})
export class MiscomPage implements OnInit {

  mensajes = [];
  cargando = false;

  constructor( private datos: DatosService,
               private funciones: FuncionesService,
               private router: Router,
               private alertCtrl: AlertController ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
    this.leerMisMensajes( null );
  }

  doRefresh( event ) {
    this.leerMisMensajes( event );
  }

  leerMisMensajes( event? ) {
    // this.mensajes = [];
    this.cargando = true;
    this.datos.servicioWEB( '/leerMensajes', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( dev => this.revisaRespuesta( dev, event ) );
  }
  revisaRespuesta( dev, event ) {
    this.cargando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else if ( dev.resultado === 'nodata' ) {
      this.funciones.msgAlert( 'ATENCION', 'Su casilla de mensajeria está vacía.' );
    } else if ( dev.resultado === 'ok' ) {      // asigna el dato obtenido
      this.mensajes = dev.datos;
      if ( event ) {
        event.target.complete();
      }
      if ( this.mensajes.length === 0 ) {
        this.funciones.msgAlert( 'ATENCION', 'No existen mensajes para mostrar' );
      }
      //
    }
  }

  async cerrar( id ) {
    const alert = await this.alertCtrl.create({
      header: 'CONFIRMAR',
      message: 'Esta opción no elimina su contenido, solamente cambia el estado del mensaje a "Cerrado" ',
      buttons: [
        {
          text: 'No, aún no !!',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {}
        }, {
          text: 'Sí, cerrar',
          handler: () => {
            this.cierraMensaje( id );
          }
        }
      ]
    });
    await alert.present();
  }

  cierraMensaje( idMensaje ) {
    this.cargando = true;
    this.datos.servicioWEB( '/cierraMensaje', { id: idMensaje, empresa: this.datos.idempresa, ficha: this.datos.ficha } )
        .subscribe( dev => this.revisaRespuestaCierre( dev ) );
  }
  revisaRespuestaCierre( dev ) {
    this.cargando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', 'Mensaje no pudo darse por cerrado' );
    } else {
      this.funciones.msgAlert( 'ATENCION', 'El mensaje se dio por cerrado, ' +
                               'cuando vuelva a cargar esta lista o a refrescarla, verá el resultado' );
    }
  }

}
