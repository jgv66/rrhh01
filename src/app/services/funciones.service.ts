import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FuncionesService {

  constructor(private alertCtrl: AlertController,
              private toastCtrl: ToastController) { }

  textoSaludo() {
    const dia   = new Date();
    if ( dia.getHours() >= 8  && dia.getHours() < 12 ) {
      return 'Buenos días ';
    } else if ( dia.getHours() >= 12 && dia.getHours() < 19 ) {
      return 'Buenas tardes ';
    } else {
      return 'Buenas noches ';
    }
  }

  async msgAlert( titulo, texto, subtitulo? ) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      subHeader: ( subtitulo ) ? subtitulo : null,
      message: texto,
      buttons: ['OK']
    });
    await alert.present();
  }

  async muestraySale( cTexto, segundos, posicion? ) {
    const toast = await this.toastCtrl.create({
      message: cTexto,
      duration: 1500 * segundos,
      position: posicion || 'middle'
    });
    toast.present();
  }

}
