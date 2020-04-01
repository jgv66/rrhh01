import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DatosService } from '../../services/datos.service';
import { FuncionesService } from '../../services/funciones.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Geolocation } from '@ionic-native/geolocation/ngx';
declare var google;

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.page.html',
  styleUrls: ['./asistencia.page.scss'],
})
export class AsistenciaPage implements OnInit {

  @ViewChild( 'map', {static: false}) mapElement: ElementRef;
  map: any;
  address: string;

  googleMapKey = 'AIzaSyDSPDpkFznGgzzBSsYvTq_sj0T0QCHRgwM';

  cargando = false;
  asistencia = [];
  lat;
  lng;

  constructor( private funciones: FuncionesService,
               private datos: DatosService,
               private router: Router,
               private modalCtrl: ModalController,
               private geolocation: Geolocation ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
  }

  ingres_() {
    this.cargando = true;
    // let startPos;
    // const geoSuccess = ( position ) => {
    //   startPos = position;
    //   document.getElementById('startLat').innerHTML = startPos.coords.latitude;
    //   document.getElementById('startLon').innerHTML = startPos.coords.longitude;
    // };
    // navigator.geolocation.getCurrentPosition(geoSuccess);
    navigator.geolocation.getCurrentPosition( pos => {
      console.log( pos );
      this.lat = pos.coords.latitude;
      this.lng = pos.coords.longitude;
      this.cargando = false;
    });
  }

  ingreso() {
    //
    this.geolocation.getCurrentPosition()
        .then((resp) => {
          const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
          const mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

          this.map.addListener('tilesloaded', () => {
            console.log('accuracy', this.map);
          });

    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  salida() {}

}
