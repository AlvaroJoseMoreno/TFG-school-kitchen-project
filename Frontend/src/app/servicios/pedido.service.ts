import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor(private http: HttpClient) { }

  getPedidos( texto?: string, colegio?: string, estado?: string ): Observable<object> {

    let query = '';
    if (texto != '' || colegio != '' || estado != ''){
      query = '?params=true'
    }
    if (texto != '') {query += `&texto=${texto}`;}
    if (colegio != '') { query += `&colegio=${colegio}`; }
    if (estado != '') { query += `&estado=${estado}`; }

    return this.http.get(`${environment.base_url}/pedidos/${query}`, this.cabeceras);
  }

  getPedidosProveedor( texto?: string, proveedor?: string, estado?: string ): Observable<object> {

    let query = '';
    if (texto != '' || proveedor != '' || estado != ''){
      query = '?params=true'
    }
    if (texto != '') {query += `&texto=${texto}`;}
    if (proveedor != '') { query += `&proveedor=${proveedor}`; }
    if (estado != '') { query += `&estado=${estado}`; }

    return this.http.get(`${environment.base_url}/pedidos/${query}`, this.cabeceras);
  }

  getPedido( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/pedidos?id=${uid}` , this.cabeceras);
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
