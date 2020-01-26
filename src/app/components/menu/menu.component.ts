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
    { title: 'Bienvenida',          url: '/home',   icon: 'home',     caso: 0 },
    { title: 'Ingresar a miPortal', url: '/login',  icon: 'md-key',   caso: 1 },
    {
      title: 'Mis datos',
      children: [
        { title: 'Mi Ficha',          url: '/mificha',          icon: 'contact' },
        { title: 'Mis liquidaciones', url: '/misliquidaciones', icon: 'paper'   },
      ]
    },
    {
      title: 'Mis Solicitudes',
      children: [
        { title: 'Anticipos',     url: '/anticipo',         icon: 'cash'        },
        { title: 'Vacaciones',    url: '/misvacaciones',    icon: 'ice-cream'   },
        { title: 'Licencias',     url: '/mislicencias',     icon: 'medkit'      },
        { title: 'Certificados',  url: '/miscertificados',  icon: 'folder-open' },
      ]
    },
    {
      title: 'Me Cambié',
      children: [
        { title: 'De domicilio',          url: '/mecambie/domicilio', icon: 'pin'         },
        { title: 'De número telefónico',  url: '/mecambie/numero',    icon: 'call'        },
        { title: 'De Afp',                url: '/mecambie/afp',       icon: 'trending-up' },
        { title: 'De Isapre',             url: '/mecambie/isapre',    icon: 'nuclear'     },
      ] 
    },
    {
      title: 'Mensajería',
      children: [
        { title: 'Estado de mis solicitudes', url: '/miscom', icon: 'mail'  },
      ]
    },
    { title: 'Cerrar sesión', url: '/logout', icon: 'md-exit',  caso: 2 }
  ];

  constructor( private router: Router,
               private alertCtrl: AlertController,
               public  datos: DatosService,
               public  funciones: FuncionesService ) { }

  ngOnInit() {}

  onoff() {
    return ( this.datos.ficha ) ? false : true;
  }

  // login() {
  //   this.router.navigate( ['/login'] );
  // }

  // async logout() {
  //   const xn = this.datos.nombre;
  //   const alert = await this.alertCtrl.create({
  //     header: 'CONFIRME',
  //     message: 'Desea salir y cerrar la sesión de miPortal?',
  //     buttons: [
  //       {
  //         text: 'Aún no',
  //         role: 'cancel',
  //         cssClass: 'secondary',
  //         handler: (blah) => null
  //       }, {
  //         text: 'Sí',
  //         handler: () => {
  //           this.datos.ficha  = undefined;
  //           this.datos.nombre = undefined;
  //           this.router.navigate(['/home']);
  //           this.funciones.muestraySale( 'Nos vemos, que tengas un excelente día!', 2, 'middle' );
  //         }
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }

}
