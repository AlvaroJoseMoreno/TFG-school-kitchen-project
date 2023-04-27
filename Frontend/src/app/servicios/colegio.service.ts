import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

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
