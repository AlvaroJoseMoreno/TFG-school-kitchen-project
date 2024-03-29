import { Injectable } from '@angular/core';
import { Usuario } from '../modelos/usuario.model';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { Colegio } from '../modelos/colegio.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuario: Usuario = new Usuario('', '');
  constructor( private http: HttpClient,
               private router: Router ) { }

  getUsuarios( texto?: string, rol?: string, colegio?: string ): Observable<object> {

    let query = '';

    if(texto != '' || rol != '' || colegio != ''){
      query = '?params=true'
    }

    if (texto != '') {query += `&texto=${texto}`;}
    if(rol != '') { query += `&rol=${rol}` };
    if(colegio != '') { query += `&colegio=${colegio}` }

    return this.http.get(`${environment.base_url}/usuarios/${query}`, this.cabeceras);
  }

  getUsuario( uid: string): Observable<object> {
    return this.http.get(`${environment.base_url}/usuarios?id=${uid}`, this.cabeceras);
  }

  getMetricarAdmin(colegio?: string): Observable<object> {
    return this.http.get(`${environment.base_url}/usuarios/getMetricasAdmin?colegio=${colegio}`, this.cabeceras);
  }

  getVerifyLink(code: string, uid: string): Observable<object> {
    return this.http.get(`${environment.base_url}/login/validar/${code}?id=${uid}`, this.cabeceras);
  }

  getRecoveryLink(code: string, uid: string): Observable<object> {
    return this.http.get(`${environment.base_url}/login/recovery/${code}?id=${uid}`, this.cabeceras);
  }

  cambiarPWD(code: string, uid: string, data: any): Observable<object> {
    return this.http.put(`${environment.base_url}/login/cambiarpwd/${code}?id=${uid}`, data, this.cabeceras);
  }

  nuevoAdmin(data: Usuario){
    return this.http.post(`${environment.base_url}/usuarios/admin`, data, this.cabeceras);
  }

  nuevoSupervisor(data: Usuario){
    return this.http.post(`${environment.base_url}/usuarios/super`, data, this.cabeceras);
  }

  nuevoCocinero(data: Usuario){
    return this.http.post(`${environment.base_url}/usuarios/cocinero`, data, this.cabeceras);
  }

  nuevoProveedor(data: Usuario){
    return this.http.post(`${environment.base_url}/usuarios/proveedor`, data, this.cabeceras);
  }

  borrarUsuario(uid: string){
    return this.http.delete(`${environment.base_url}/usuarios/${uid}`, this.cabeceras);
  }

  sendEmailRecovery(email: any){
    return this.http.post(`${environment.base_url}/login/sendrecovery`, email, this.cabeceras);
  }

  login( formData: any) {
    return this.http.post(`${environment.base_url}/login`, formData).pipe(
      tap((res : any) => {
        if(formData.remember)localStorage.setItem('token', res['token']);
        else sessionStorage.setItem('token', res['token']);
        const {uid, rol} = res;
        this.usuario = new Usuario(uid, rol);
      })
    );
  }

  validar(correcto: boolean, incorrecto: boolean): Observable<boolean> {

    if (this.token === '') {
      this.limpiarLocalStore();
      return of(incorrecto);
    }

    return this.http.get(`${environment.base_url}/login/token`, this.cabeceras)
      .pipe(
        tap( (res: any) => {
          const { uid, nombre, telefono, rol, registerDate, imagen, email, tipo_proveedor, ciudad, colegio, token} = res;
          if (localStorage.getItem('token')){
            localStorage.setItem('token', token);
          } else if (sessionStorage.getItem('token')){
            sessionStorage.setItem('token', token);
          }
          this.usuario = new Usuario(uid, rol, email, nombre, telefono, registerDate, imagen, tipo_proveedor, ciudad, colegio);
        }),
        map ( res => {
          return correcto;
        }),
        catchError ( err => {
          this.limpiarLocalStore();
          return of(incorrecto);
        })
      );
  }

  logout(): void {
    this.limpiarLocalStore();
    this.router.navigateByUrl('/login');
  }

  limpiarLocalStore(): void{
    localStorage.clear();
    sessionStorage.clear();
  }

  validarToken(): Observable<boolean> {
    return this.validar(true, false);
  }

  validarNoToken(): Observable<boolean> {
    return this.validar(false, true);
  }

  setTypeProveedor(tipo: any): string{
    let tipo_proveedor = '';
    switch (tipo) {
      case 'CARNE':
        tipo_proveedor = 'Carne'
        break;
      case 'PESCADO':
        tipo_proveedor = 'Pescado'
        break;
      case 'FRUTAVERDURA':
        tipo_proveedor = 'Fruta y verdura'
        break;
      case 'LACTEOS':
        tipo_proveedor = 'Lacteos'
        break;
      case 'ESPECIAS':
        tipo_proveedor = 'Especias'
        break;
      case 'DULCES':
        tipo_proveedor = 'Dulces'
        break;
      default:
        break;
    }
    return tipo_proveedor;
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

   get colegio(): string | undefined{
     return this.usuario.colegio;
   }

}
