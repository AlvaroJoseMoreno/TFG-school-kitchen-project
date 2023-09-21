import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { Colegio } from '../modelos/colegio.model';

@Injectable({
  providedIn: 'root'
})
export class ColegioService {

  constructor(private http: HttpClient) { }

  getColegios( texto?: string, provincia?: string ): Observable<object> {

    let query = '';

    if(texto != '' || provincia != ''){
      query = '?params=true'
    }

    if (texto != '') {query += `&nombre=${texto}`;}
    if (provincia != '') { query += `&provincia=${provincia}` };

    return this.http.get(`${environment.base_url}/colegios/${query}`, this.cabeceras);
  }

  getColegio(uid: string): Observable<object> {
    let query = `?id=${uid}`;
    return this.http.get(`${environment.base_url}/colegios/${query}`, this.cabeceras);
  }

  crearColegio(data: Colegio): Observable<object> {
    return this.http.post(`${environment.base_url}/colegios`, data, this.cabeceras)
  }

  borrarColegio(data: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/colegios/${data}`, this.cabeceras);
  }

  get cabeceras() {
    return {
      headers: {
        'x-token': this.token
      }};
  }

  get token(): string {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  }

}
