import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { SERVER_URL } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatosService {

  url = SERVER_URL;     // 'http://23.239.29.171:3070';
  ficha: string;        // numero de ficha del usuario dentro de softland
  nombre: string;       // nombre del usuario en softland

  constructor( private http: HttpClient,
               private storage: Storage ) { }

  servicioWEB( cSP: string, parametros?: any ) {
    const accion = cSP;
    const url    = this.url + accion;
    const body   = parametros;
    return this.http.post( url, body );
  }

  // set a key/value
  guardarDato( key, value ) {
    this.storage.set( key, value );
  }
  async leerDato( key ) {
    return await this.storage.get( key );
  }


}
