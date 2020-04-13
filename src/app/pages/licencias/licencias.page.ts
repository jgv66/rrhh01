import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-licencias',
  templateUrl: './licencias.page.html',
  styleUrls: ['./licencias.page.scss'],
})
export class LicenciasPage implements OnInit {

  cargando = false;
  informando = false;
  avisos: any;
  enviando = false;
  finicio = new Date();
  ffinal = new Date();
  comentario = '';

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
    // this.cargando = true;
    this.avisos = undefined;
    this.datos.servicioWEB( '/leerLicencias', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( (dev: any) => {
            console.log(dev);
            this.cargando = false;
            if ( dev.resultado === 'error' ) {
              this.funciones.msgAlert( 'ATENCION', 'Error al consultar licencias previas' ); //dev.datos.originalError.info.message
            } else if ( dev.resultado === 'nodata' ) {
              this.funciones.msgAlert( 'ATENCION', 'No existen datos de licencias previas.' );
            } else if ( dev.resultado === 'ok' ) {
              this.avisos = dev.datos[0];
              if ( event ) {
                event.target.complete();
              }
            }
        },
        ( err: any )  => {
            this.cargando = false;
            console.log(err);
        });
  }
  doRefresh( event ) {
    this.cargarDatos( event );
  }

  informar() {
    this.informando = !this.informando;
  }

  enviar() {
    //
    const xdesde = new Date(this.finicio + 'T00:00:00');
    const xhasta = new Date(this.ffinal + 'T00:00:00');
    const diasdiff = this.funciones.diferenciaEntreDiasEnDias( xdesde, xhasta ) + 1;
    //
    if ( xhasta >= xdesde )  {
      this.enviando = true;
      //
      const hinicio = this.funciones.fechaHumano( xdesde );
      const hfinal  = this.funciones.fechaHumano( xhasta );
      //
      this.datos.servicioWEB( '/informarLicencia', { ficha: this.datos.ficha, desde: hinicio, hasta: hfinal, dias: diasdiff, comentario: this.comentario, empresa: this.datos.idempresa } )
          .subscribe( dev => this.revisaRespuesta( dev ) );
      //
    } else {
      this.funciones.msgAlert( 'ATENCION', 'Problemas con las fechas.', 'Corrija y reintente' );
    }
  }
  revisaRespuesta( dev ) {
    this.enviando = false;
    //
    if ( dev.resultado === 'ok' ) {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'Enviado y registrado' );
      this.router.navigate(['/home']);
    } else {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'REINTENTE LUEGO' );
    }
    //
  }

}
