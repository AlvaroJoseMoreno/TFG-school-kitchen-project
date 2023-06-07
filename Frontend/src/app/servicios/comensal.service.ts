import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ComensalService {

  constructor(private http: HttpClient) { }

  getComensal(uid: string): Observable<object> {

    let query = `?id=${uid}`;

    return this.http.get(`${environment.base_url}/comensales/${query}`, this.cabeceras);
  }

  getComensales( fecha?: Date, colegio?: string ): Observable<object> {

    let query = '';
    if (fecha != undefined || colegio != ''){
      query = '?params=true'
    }
    if (fecha != undefined) {query += `&fecha=${fecha}`;}
    if (colegio != '') { query += `&colegio=${colegio}`; }

    return this.http.get(`${environment.base_url}/comensales/${query}`, this.cabeceras);
  }

  crearComensales(data: any): Observable<object>{
    return this.http.post(`${environment.base_url}/comensales`, data, this.cabeceras);
  }

  borrarComensales(uid: string){
    return this.http.delete(`${environment.base_url}/comensales/${uid}`, this.cabeceras);
  }

  getComensalesPorDia( fecha1?: string, fecha2?: string ): Observable<object> {

    let query = '';
    if (fecha1 != undefined || fecha2 != undefined){
      query = '?params=true'
    }
    if (fecha1 != undefined) { query += `&fecha1=${fecha1}`;}
    if (fecha2 != undefined) { query += `&fecha2=${fecha2}`; }

    return this.http.get(`${environment.base_url}/comensales/getData/${query}`, this.cabeceras);
  }

  getComensalesPorDiaSuper(colegio: string, fecha1?: string, fecha2?: string ): Observable<object> {

    let query = `?colegio=${colegio}`;

    if (fecha1 != undefined) { query += `&fecha1=${fecha1}`;}
    if (fecha2 != undefined) { query += `&fecha2=${fecha2}`; }

    return this.http.get(`${environment.base_url}/comensales/getDataSupervisor/${query}`, this.cabeceras);
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
