import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-mecambie',
  templateUrl: './mecambie.page.html',
  styleUrls: ['./mecambie.page.scss'],
})
export class MecambiePage implements OnInit {

  ficha: any = [];
  region;
  regiones: any[];
  ciudad;
  ciudades: any[];
  comuna;
  comunas: any[];
  cargando = false;
  caso;
  datoNuevo1 = '';
  datoNuevo2 = '';
  datoNuevo3 = '';
  isapres = [];
  afps = [];

  constructor( private menuCtrl: MenuController,
               private datos: DatosService,
               private router: Router,
               private parametros: ActivatedRoute,
               private funciones: FuncionesService ) {
      this.caso = this.parametros.snapshot.paramMap.get('caso');
      // console.log( this.caso );
  }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }
  ionViewWillEnter() {
    this.cargando = true;
    this.datos.servicioWEB( '/leerFicha', { ficha: this.datos.ficha, empresa: this.datos.idempresa } )
        .subscribe( dev => this.revisaRespuesta( dev ) );
    if ( this.caso === 'domicilio' ) {
      this.lasRegiones();
    } else if ( this.caso === 'afp' ) {
      this.lasAfps();
    } else if ( this.caso === 'isapre' ) {
      this.lasIsapres();
    }
  }
  revisaRespuesta( dev ) {
    this.cargando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      this.ficha = dev.datos[0];
    }
  }

  lasRegiones() {
    this.datos.servicioWEB( '/leerRegiones', { empresa: this.datos.idempresa, ficha: this.datos.ficha } )
    .subscribe( dev => this.revisaRegiones( dev ) );
  }
  revisaRegiones( dev ) {
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      this.regiones = dev.datos;
    }
  }
  lasCiudades() {
    this.datos.servicioWEB( '/leerCiudades', { region: this.region.toString(), empresa: this.datos.idempresa, ficha: this.datos.ficha } )
    .subscribe( dev => this.revisaCiudades( dev ) );
  }
  revisaCiudades( dev ) {
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      this.ciudades = dev.datos;
    }
  }
  lasComunas() {
    this.datos.servicioWEB( '/leerComunas', { region: this.region, empresa: this.datos.idempresa, ficha: this.datos.ficha } )
    .subscribe( dev => this.revisaComunas( dev ) );
  }
  revisaComunas( dev ) {
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      this.comunas = dev.datos;
    }
  }
  lasIsapres() {
    this.datos.servicioWEB( '/leerIsapres', { empresa: this.datos.idempresa, ficha: this.datos.ficha } )
    .subscribe( dev => this.revisaIsapres( dev ) );
  }
  revisaIsapres( dev ) {
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      this.isapres = dev.datos;
    }
  }
  lasAfps() {
    this.datos.servicioWEB( '/leerAfps', { empresa: this.datos.idempresa, ficha: this.datos.ficha }  )
    .subscribe( dev => this.revisaAfps( dev ) );
  }
  revisaAfps( dev ) {
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else {
      this.afps = dev.datos;
    }
  }

  menuToggle() {
    this.menuCtrl.toggle();
  }

  solicitarCambio() {
    this.cargando = true;
    this.datos.servicioWEB( '/cambiarDatosFicha',
                            { ficha: this.datos.ficha,
                              empresa: this.datos.idempresa,
                              caso:  this.caso,
                              dato1: this.datoNuevo1,
                              dato2: this.datoNuevo2,
                              dato3: this.datoNuevo3 } )
        .subscribe( dev => this.revisaRespuestaCambio( dev ) );
  }
  revisaRespuestaCambio( dev ) {
    this.cargando = false;
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.mensaje );
    } else {
      this.funciones.msgAlert( 'ATENCION', 'La solicitud de cambio fue enviada con exito.' + dev.mensaje );
      this.router.navigate(['/home']);
    }
  }

}
