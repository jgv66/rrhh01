import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, MenuController } from '@ionic/angular';
import { SignupPage } from '../signup/signup.page';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  miRut = '';
  miClave = '';
  cargando = false;

  constructor(private router: Router,
              private menuCtrl: MenuController,
              private datos: DatosService,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    this.datos.leerDato( 'ks_usuario' )
        .then( dato => {
          if ( dato ) {
            this.miRut   = dato;
            this.miClave = '';
          } else {
            this.miRut = '';
            this.miClave = '';
          }
        });
  }

  menuToggle() {
    console.log(111111);
    this.menuCtrl.toggle();
  }

  login() {
    this.cargando = true;
    this.datos.servicioWEB( '/validarUser', { rut: this.miRut, clave: this.miClave } )
        .subscribe( dev => this.revisaRespuesta( dev ) );
  }
  revisaRespuesta( dev ) {
    this.cargando = false;
    //
    // console.log(dev);
    if ( dev.datos[0].error ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos[0].mensaje );
    } else if ( dev.datos[0].resultado ) {
      // asigana el dato obtenido
      this.datos.ficha  = dev.datos[0].ficha;
      this.datos.nombre = dev.datos[0].nombre;
      // se guarda para futuros accesos
      this.datos.guardarDato( 'ks_usuario', this.miRut );
      //
      this.router.navigate(['/home']);
      this.funciones.muestraySale( this.funciones.textoSaludo() + this.datos.nombre, 1.5, 'bottom' );
      //
    }
  }

  iforgot() {}
  
  async signup() {
    const modal = await this.modalCtrl.create({
      component: SignupPage
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    // console.log( data );
  }

}
