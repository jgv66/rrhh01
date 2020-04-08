import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FuncionesService } from '../../services/funciones.service';
import { DatosService } from '../../services/datos.service';

@Component({
  selector: 'app-anticipo',
  templateUrl: './anticipo.page.html',
  styleUrls: ['./anticipo.page.scss'],
})
export class AnticipoPage implements OnInit {

  cargando = false;
  monto: number;
  fecha: Date = new Date();

  constructor( private funciones: FuncionesService,
               private datos: DatosService,
               private router: Router ) { }

  ngOnInit() {
    console.log(this.datos.idempresa);
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }

  enviar() {
    //
    const xmes = (new Date()).getMonth();
    const xano = (new Date()).getFullYear();
    const xfecha = new Date(this.fecha);
    const hFecha = this.funciones.fechaHumano( xfecha );
    //
    if ( this.monto <= 0) {
      this.funciones.msgAlert( 'ATENCION', 'El monto no puede ser negativo o cero.', 'Corrija y reintente' );
    } else if ( xfecha.getMonth() !== xmes ) {
      this.funciones.msgAlert( 'ATENCION', 'El mes no puede ser distinto del actual.', 'Corrija y reintente' );
    } else if ( xfecha.getFullYear() !== xano ) {
      this.funciones.msgAlert( 'ATENCION', 'El año no puede ser distinto del actual.', 'Corrija y reintente' );
    } else {
      this.cargando = true;
      this.datos.servicioWEB( '/pedirAnticipo', { ficha: this.datos.ficha, monto: this.monto, fecha: hFecha } )
          .subscribe( dev => this.revisaRespuesta( dev ) );
    }
  }

  revisaRespuesta( dev ) {
    this.cargando = false;
    //
    if ( dev.resultado === 'ok' ) {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'Enviado y registrado' );
      this.router.navigate(['/home']);
    } else {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje, 'REINTENTE LUEGO' );
    }
  }

}
