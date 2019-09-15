import { Component, OnInit } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-mificha',
  templateUrl: './mificha.page.html',
  styleUrls: ['./mificha.page.scss'],
})
export class MifichaPage implements OnInit {

  ficha: any[];
  cargando = false;
  fficha ='';


  constructor( private datos: DatosService,
               private funciones: FuncionesService ) { }

  ngOnInit() {
    this.cargando = true;
    this.datos.servicioWEB( '/leerFicha', { ficha: this.datos.ficha } )
        .subscribe( dev => this.revisaRespuesta( dev ) );
  }

  revisaRespuesta( dev ) {
    this.cargando = false;
    // console.log( dev.datos[0] );
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      // asigna el dato obtenido
      this.ficha = dev.datos[0];
      // console.log( this.ficha );
      //
    }
  }

}
