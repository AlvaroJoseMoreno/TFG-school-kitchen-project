import { Injectable } from '@angular/core';
import { Usuario } from '../modelos/usuario.model';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuario: Usuario = new Usuario('', '');
  constructor( private http: HttpClient ) { }

  login( formData: any) {
    console.log(formData);
    return this.http.post(`${environment.base_url}/login`, formData).pipe(
      tap( (res : any) => {
        console.log(res);
        if(formData.remember)localStorage.setItem('x-token', res['token']);
        else sessionStorage.setItem('x-token', res['token']);
        const {uid, rol} = res;
        this.usuario = new Usuario(uid, rol);
      })
    );
  }

  get cabeceras() {
    return {
      headers: {
        'x-token': this.token
      }};
  }

  get token(): string {
    return localStorage.getItem('x-token') || sessionStorage.getItem('x-token') || '';
  }

 get uid(): string {
    return this.usuario.uid;
  }

  get rol(): string {
    return this.usuario.rol;
  }

  get registerDate(): Date | undefined {
    return this.usuario.registerDate;
  }

  get tipoProveedor(): string | undefined {
    return this.usuario.tipo_proveedor;
  }

  get nombre(): string | undefined{
    return this.usuario.nombre;
  }

  get email(): string | undefined{
    return this.usuario.email;
  }

  get telefono(): string | undefined{
    return this.usuario.telefono;
  }

  get ciudad(): string | undefined{
    return this.usuario.ciudad;
  }

  get imagen(): string | undefined{
    return this.usuario.imagen;
  }

  // get colegio(): Colegio | undefined{
  //   return this.usuario.colegio;
  // }

}
