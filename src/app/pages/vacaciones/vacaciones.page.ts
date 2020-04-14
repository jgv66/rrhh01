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
  misdatos: any = {};
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
    this.datos.servicioWEB( '/leerVacaciones', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( (dev: any) => {
            // console.log(dev);
            if ( dev.resultado === 'error' ) {
              this.cargando = false;
              // this.funciones.msgAlert( 'ATENCION', dev[0].datos );
            } else {
              this.misdatos = dev.datos[0];
              this.detalleVacaciones( event );
            }
        });
  }
  detalleVacaciones( event? ) {
    this.datos.servicioWEB( '/leerDetalleVacaciones', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( (dev: any) => {
            // console.log(dev.datos);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              // this.funciones.msgAlert( 'ATENCION', dev[0].datos );
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
    const xdesde = new Date(this.finicio + 'T00:00:00');
    const xhasta = new Date(this.ffinal + 'T00:00:00');
    const diasdiff = this.funciones.diferenciaEntreDiasEnDias( xdesde, xhasta ) + 1;
    //
    if ( xhasta >= xdesde )  {
      this.solicitando = true;
      //
      const hinicio = this.funciones.fechaHumano( xdesde );
      const hfinal  = this.funciones.fechaHumano( xhasta );
      //
      this.datos.servicioWEB( '/pedirVacaciones', { ficha: this.datos.ficha, desde: hinicio, hasta: hfinal, dias: diasdiff, empresa: this.datos.idempresa } )
          .subscribe( dev => this.revisaRespuesta( dev ) );
      //
    } else {
      this.funciones.msgAlert( 'ATENCION', 'Problemas con las fechas.', 'Corrija y reintente' );
    }
  }
  revisaRespuesta( dev ) {
    this.solicitando = false;
    //
    if ( dev.resultado === 'ok' ) {
      this.vacaciones = false;
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'Enviado y registrado' );
      this.router.navigate(['/home']);
    } else {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'REINTENTE LUEGO' );
    }
    //
  }

}
