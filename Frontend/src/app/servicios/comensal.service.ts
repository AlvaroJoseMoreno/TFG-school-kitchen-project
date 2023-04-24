import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ComensalService {

  constructor(private http: HttpClient) { }

  getComensales( fecha?: Date, colegio?: string ): Observable<object> {

    let query = '';
    if (fecha != undefined || colegio != ''){
      query = '?params=true'
    }
    if (fecha != undefined) {query += `&fecha=${fecha}`;}
    if (colegio != '') { query += `&colegio=${colegio}`; }

    return this.http.get(`${environment.base_url}/comensales/${query}`, this.cabeceras);
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
