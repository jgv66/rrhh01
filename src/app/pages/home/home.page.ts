import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private menuCtrl: MenuController,
              private router: Router ) {}

  menuToggle() {
    console.log(111111);
    this.menuCtrl.toggle();
  }

  ingresar() {
    this.router.navigateByUrl('/login');
  }

}
