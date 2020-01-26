import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.page.html',
  styleUrls: ['./logout.page.scss'],
})
export class LogoutPage implements OnInit {

  constructor( public datos: DatosService,
               private funciones: FuncionesService,
               private menuCtrl: MenuController,
               private router: Router ) { }

  ngOnInit() {
  }

  menuToggle() {
    this.menuCtrl.toggle();
  }

  byebye() {
    this.datos.logeado = false;
    this.datos.ficha  = undefined;
    this.datos.nombre = undefined;
    this.router.navigate(['/home']);
    this.funciones.muestraySale( 'Nos vemos, que tengas un excelente día!', 2, 'middle' );
  }

}
