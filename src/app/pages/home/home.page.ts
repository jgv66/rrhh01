import { MenuController, ModalController } from '@ionic/angular';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private menuCtrl: MenuController,
              private router: Router ) {}

  ingresar() {
    this.router.navigateByUrl('/login');
  }

}
