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
  email: string;        // email del usuario en softland
  logeado = false;

  constructor( private http: HttpClient,
               private storage: Storage ) {
    this.logeado = false;
  }

  servicioWEB( cSP: string, parametros?: any ) {
    const url    = this.url + cSP;
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
