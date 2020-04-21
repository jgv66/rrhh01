import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { DatosService } from '../../services/datos.service';

declare var mapboxgl: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit, AfterViewInit {

  @Input() item;
  lat: number;
  lng: number;
  cargando = true;

  constructor(private modalCtrl: ModalController,
              private router: Router,
              private datos: DatosService ) { }

  ngOnInit() {
    if ( this.datos.ficha === undefined ) {
      this.router.navigate(['/home']);
    }
    //
    console.log( this.item );
    this.lat = parseFloat(this.item.in_lat);
    this.lng = parseFloat(this.item.in_lng);
    console.log(this.lat, this.lng);
    //
  }

  ngAfterViewInit() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGJ6YXAiLCJhIjoiY2s5MjN4dmlxMDNuczNlcWs5eW0wbjAxdyJ9.FDQolowzykk8G9gJbEdTrQ';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [ this.lng, this.lat ],
      zoom: 13,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.on('load', () => {
      //
      map.resize();
      // marker
      new mapboxgl.Marker()
        .setLngLat([ this.lng, this.lat ])
        .addTo( map );

      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;

      let labelLayerId;
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }
      this.cargando = false;
      map.addLayer(
        {
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
            ],
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }},
        labelLayerId
      );
    });
  }

  salir() {
    this.modalCtrl.dismiss();
  }

}
