import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Provincia } from '../modelos/provincia.model';


@Injectable({
  providedIn: 'root'
})
export class ProvinciaService {

  constructor(private http: HttpClient) { }

  getProvincias( texto?: string ): Observable<object> {

    let query = '';
    if (texto != '') {query += `?nombre=${texto}`;}

    return this.http.get(`${environment.base_url}/provincias/${query}`, this.cabeceras);
  }

  getProvinciasByColegio(): Observable<object> {
    return this.http.get(`${environment.base_url}/provincias/provinciasporcolegio`, this.cabeceras);
  }

  crearProvincia(data: Provincia): Observable<object> {
    return this.http.post(`${environment.base_url}/provincias`, data, this.cabeceras);
  }

  borrarProvincia(data: string): Observable<object> {
    return this.http.delete(`${environment.base_url}/provincias/${data}`, this.cabeceras);
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
