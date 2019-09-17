import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-miscom',
  templateUrl: './miscom.page.html',
  styleUrls: ['./miscom.page.scss'],
})
export class MiscomPage implements OnInit {

  mensajes = [];
  cargando = false;

  constructor( private datos: DatosService,
               private funciones: FuncionesService) { }

  ngOnInit() {
    this.cargando = true;
    this.datos.servicioWEB( '/leerMensajes', { ficha: this.datos.ficha } )
        .subscribe( dev => this.revisaRespuesta( dev ) );
  }

  revisaRespuesta( dev ) {
    this.cargando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      // asigna el dato obtenido
      this.mensajes = dev.datos;
      //
    }
  }

}
