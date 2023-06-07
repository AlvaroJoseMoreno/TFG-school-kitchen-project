import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Ingrediente } from '../modelos/ingrediente.model';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {

  constructor(private http: HttpClient) { }

  getIngrediente(uid: string): Observable<object> {
    let query = `?id=${uid}`
    return this.http.get(`${environment.base_url}/ingredientes/${query}`, this.cabeceras);
  }

  getIngredientes( texto?: string, proveedor?: string ): Observable<object> {

    let query = '';
    if (texto != '' || proveedor != ''){
      query = '?params=true'
    }
    if (texto != '') {query += `&texto=${texto}`;}
    if (proveedor != '') { query += `&proveedor=${proveedor}`; }

    return this.http.get(`${environment.base_url}/ingredientes/${query}`, this.cabeceras);
  }

  crearIngrediente(data: any): Observable<object>{
    return this.http.post(`${environment.base_url}/ingredientes`, data, this.cabeceras);
  }

  borrarIngrediente(uid: string){
    return this.http.delete(`${environment.base_url}/ingredientes/${uid}`, this.cabeceras);
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
