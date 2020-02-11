import { Component, OnInit } from '@angular/core';

import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vacaciones',
  templateUrl: './vacaciones.page.html',
  styleUrls: ['./vacaciones.page.scss'],
})
export class VacacionesPage implements OnInit {

  cargando = false;
  solicitando = false;
  vacaciones = false;
  hoy = new Date();
  misdatos = {};
  finicio = new Date();
  ffinal  = new Date();
  solicitudes = [];

  constructor( public datos: DatosService,
               private funciones: FuncionesService,
               private router: Router) {}

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
    this.cargarDatos();
  }

  cargarDatos( event? ) {
    this.cargando = true;
    this.datos.servicioWEB( '/leerVacaciones', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            if ( dev.resultado === 'error' ) {
              this.cargando = false;
              this.funciones.msgAlert( 'ATENCION', dev[0].datos );
            } else {
              this.misdatos = dev.datos[0];
              this.detalleVacaciones( event );
            }
        });
  }
  detalleVacaciones( event? ) {
    this.datos.servicioWEB( '/leerDetalleVacaciones', { ficha: this.datos.ficha } )
        .subscribe( (dev: any) => {
            console.log(dev.datos);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', dev[0].datos );
            } else {
              this.solicitudes = dev.datos;
              if ( event ) {
                event.target.complete();
              }
            }
        });
  }
  doRefresh( event ) {
    this.cargarDatos( event );
  }

  solicitar() {
    this.vacaciones = !this.vacaciones;
  }

  enviar() {
    //
    const hoy = new Date();
    //
    console.log( this.finicio, this.ffinal, hoy ) ;
    //
    if ( this.finicio < hoy ) {
      this.funciones.msgAlert( 'ATENCION', 'La fecha inicial no puede ser menor a la fecha actual.', 'Corrija y reintente' );
    } else if ( this.finicio > this.ffinal ) {
      this.funciones.msgAlert( 'ATENCION', 'La fecha final no puede ser menor a la fecha inicial.', 'Corrija y reintente' );
    } else {
      this.solicitando = true;
      this.datos.servicioWEB( '/pedirVacaciones', { ficha: this.datos.ficha, finicial: this.finicio, ffinal: this.ffinal } )
          .subscribe( dev => this.revisaRespuesta( dev ) );
    }
  }
  revisaRespuesta( dev ) {
    this.solicitando = false;
    //
    if ( dev.resultado === 'ok' ) {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'Enviado y registrado' );
      this.router.navigate(['/home']);
    } else {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'REINTENTE LUEGO' );
    }
  }

}
