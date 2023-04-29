import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlatoService {

  constructor(private http: HttpClient) { }

  getPlatos( texto?: string, colegio?: string ): Observable<object> {

    let query = '';
    if (texto != '' || colegio != ''){
      query = '?params=true'
    }
    if (texto != '') {query += `&texto=${texto}`;}
    if (colegio != '') { query += `&colegio=${colegio}`; }

    return this.http.get(`${environment.base_url}/platos/${query}`, this.cabeceras);
  }

  getPlato( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/platos?id=${uid}` , this.cabeceras);
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
