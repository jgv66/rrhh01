import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { DatosService } from 'src/app/services/datos.service';
import { FuncionesService } from 'src/app/services/funciones.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {

  acciones = [
    { redirectTo: '/mificha', nombre: 'Mi ficha' },
  ];

  constructor( private router: Router,
               private alertCtrl: AlertController,
               private datos: DatosService,
               public funciones: FuncionesService ) { }

  ngOnInit() {}

  onoff() {
    return ( this.datos.ficha ) ? false : true;
  }

  login() {
    this.router.navigate( ['/login'] );
  }

  async logout() {
    const xn = this.datos.nombre;
    const alert = await this.alertCtrl.create({
      header: 'CONFIRME',
      message: 'Desea salir y cerrar la sesión de miPortal?',
      buttons: [
        {
          text: 'Aún no',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => null
        }, {
          text: 'Sí',
          handler: () => {
            this.datos.ficha  = undefined;
            this.datos.nombre = undefined;
            this.router.navigate(['/home']);
            this.funciones.muestraySale( 'Nos vemos, que tengas un excelente día!', 2, 'middle' );
          }
        }
      ]
    });
    await alert.present();
  }

}
