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

  acciones: any = [
    { title: 'Bienvenida',          url: '/home',   icon: 'home',     caso: 0 },
    { title: 'Ingresar a miPortal', url: '/login',  icon: 'md-key',   caso: 1 },
    {
      title: 'Mis datos',
      children: [
        { title: 'Mi Ficha',          url: '/mificha',  icon: 'contact' },
        { title: 'Mis liquidaciones', url: '/misliqui', icon: 'paper'   },
      ]
    },
    {
      title: 'Mis Solicitudes',
      children: [
        { title: 'Anticipos',     url: '/anticipo',      icon: 'cash'        },
        { title: 'Certificados',  url: '/certificados',  icon: 'folder-open' },
        { title: 'Vacaciones',    url: '/misvacaciones', icon: 'ice-cream'   },
        { title: 'Licencias',     url: '/mislicencias',  icon: 'medkit'      },
      ]
    },
    {
      title: 'Mis Cambios',
      children: [
        { title: 'De domicilio',          url: '/mecambie/domicilio', icon: 'pin'         },
        { title: 'De número telefónico',  url: '/mecambie/numero',    icon: 'call'        },
        { title: 'De Afp',                url: '/mecambie/afp',       icon: 'trending-up' },
        { title: 'De Isapre',             url: '/mecambie/isapre',    icon: 'nuclear'     },
        { title: 'De clave a mi Mandala', url: '/cambioclave',        icon: 'key'         },
      ]
    },
    {
      title: 'Registro de Asistencia',
      children: [
        { title: 'Ingresar o Retirarse',  url: '/asistencia', icon: 'finger-print'  },
        { title: 'Sígueme',               url: '/followme',   icon: 'walk' },
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

}
