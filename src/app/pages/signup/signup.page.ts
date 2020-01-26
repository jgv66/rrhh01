import { Component, OnInit } from '@angular/core';
import { DatosService } from 'src/app/services/datos.service';
import { ModalController } from '@ionic/angular';
import { FuncionesService } from 'src/app/services/funciones.service';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  miRut    = '';
  miClave1 = '';
  miClave2 = '';
  cargando = false;

  constructor( public datos: DatosService,
               private modalCtrl: ModalController,
               private funciones: FuncionesService) { }

  ngOnInit() {
  }

  salir() {
    this.modalCtrl.dismiss();
  }

  registrar() {
    if ( this.miClave1 === '' || this.miClave1 !== this.miClave2 ) {
      this.funciones.msgAlert( 'ATENCION', 'No puede validar claves vacías o distintas', 'Corregir y reintentar' );
    } else {
      this.cargando = true;
      this.datos.servicioWEB( '/newUser', { rut: this.miRut, clave: this.miClave1 } )
          .subscribe( dev => this.revisaRespuesta( dev ) );
    }

  }
  revisaRespuesta( dev ) {
    this.cargando = false;
    if ( dev.datos[0].error ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else if ( dev.datos[0].resultado ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
      this.modalCtrl.dismiss({ rut: this.miRut });
    }
  }

}
