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
              public datos: DatosService,
              private funciones: FuncionesService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    this.datos.leerDato( 'ks_usuario' )
        .then( dato => {
          try {
            if ( dato ) {
              this.miRut   = dato;
              this.miClave = '';
            } else {
              this.miRut = '';
              this.miClave = '';
            }
          } catch (error) {
            this.miRut = '';
            this.miClave = '';
        }
        });
  }

  menuToggle() {
    this.menuCtrl.toggle();
  }

  volver() {
    this.router.navigate(['/home']);
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
    //
    if ( dev.resultado === 'error' ) {
      this.funciones.msgAlert( 'ATENCION', dev.datos );
    } else if ( dev.datos[0].resultado ) {
      //
      this.datos.ficha  = dev.datos[0].ficha;
      this.datos.nombre = dev.datos[0].nombre;
      this.datos.email  = dev.datos[0].email;
      //
      this.datos.guardarDato( 'ks_usuario', this.miRut );
      //
      this.datos.logeado = true;
      this.router.navigate(['/home']);
      this.funciones.muestraySale( this.funciones.textoSaludo() + this.datos.nombre, 1, 'middle' );
      //
    }
  }

  async signup() {
    const modal = await this.modalCtrl.create({
      component: SignupPage
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    // console.log( data );
  }

  iforgot() {}

}
