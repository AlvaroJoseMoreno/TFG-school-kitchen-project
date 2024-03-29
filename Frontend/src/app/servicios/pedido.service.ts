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

  getPedidosProveedor( texto?: string, proveedor?: string, estado?: string, visto_por?: string): Observable<object> {

    let query = '';
    if (texto != '' || proveedor != '' || estado != ''){
      query = '?params=true'
    }
    if (texto != '') {query += `&texto=${texto}`;}
    if (proveedor != '') { query += `&proveedor=${proveedor}`; }
    if (estado != '') { query += `&estado=${estado}`; }
    if (visto_por != '') { query += `&visto_por=${visto_por}`; }

    return this.http.get(`${environment.base_url}/pedidos/${query}`, this.cabeceras);
  }

  getPedidosMetricas(proveedor: string): Observable<object> {
    let query = `?proveedor=${proveedor}`;
    return this.http.get(`${environment.base_url}/pedidos/pedidosProveedor/${query}`, this.cabeceras);
  }

  getPedido( uid: string): Observable<object> {
    if (!uid) { uid = '';}
    return this.http.get(`${environment.base_url}/pedidos?id=${uid}` , this.cabeceras);
  }

  crearPedido(data: any): Observable<object>{
    return this.http.post(`${environment.base_url}/pedidos`, data, this.cabeceras);
  }

  recepcionarPedido(data: any, uid: string): Observable<object>{
    return this.http.put(`${environment.base_url}/pedidos/recepcionar/${uid}`, data, this.cabeceras);
  }

  borrarPedido(uid: string){
    return this.http.delete(`${environment.base_url}/pedidos/${uid}`, this.cabeceras);
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
