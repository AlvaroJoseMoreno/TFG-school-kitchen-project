import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  getMenu(uid: string): Observable<object> {
    let query = `?id=${uid}`;
    return this.http.get(`${environment.base_url}/menus/${query}`, this.cabeceras);
  }

  getMenus( dia?: Date | string, colegio?: string, tipo?: string ): Observable<object> {

    let query = '';
    if (dia != undefined || colegio != '' || tipo != ''){
      query = '?params=true'
    }
    if (dia != undefined) {query += `&dia=${dia}`;}
    if (colegio != '') { query += `&colegio=${colegio}`; }
    if (tipo != '') { query += `&tipo=${tipo}`; }

    return this.http.get(`${environment.base_url}/menus/${query}`, this.cabeceras);
  }

  crearMenu(data: any): Observable<object>{
    return this.http.post(`${environment.base_url}/menus`, data, this.cabeceras);
  }

  borrarMenu(uid: string){
    return this.http.delete(`${environment.base_url}/menus/${uid}`, this.cabeceras);
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
