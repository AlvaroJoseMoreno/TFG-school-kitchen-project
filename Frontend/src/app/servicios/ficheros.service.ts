import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FicherosService {

  constructor(private http: HttpClient) { }

  uploadPhotos(formData:File, tipo:string, uid:string){
    const datos: FormData = new FormData();
    datos.append('file', formData, formData.name);
    return this.http.post(`${environment.base_url}/ficheros/${tipo}/${uid}`, datos, this.cabeceras);
  }

  getPhotos( tipo: string, nombre: string){
    return this.http.get(`${environment.base_url}/ficheros/${tipo}/${nombre}`, this.cabeceras);
  }

  crearImagenUrl(tipo: string, imagen: string) {
    let nameFile = tipo === 'fotoperfil' ? 'default_picture.jpg' : 'default_ingrediente.png'
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    if (!imagen) {
      return `${environment.base_url}/ficheros/${tipo}/${nameFile}?token=${token}`;
    }
    return `${environment.base_url}/ficheros/${tipo}/${imagen}?token=${token}`;
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
