import { environment } from '../../environments/environment';

export class Usuario {

  constructor(
               public uid: string,
               public rol: string,
               public email?: string,
               public nombre?: string,
               public telefono?: string,
               public registerDate?: Date,
               public imagen?: string,
               public tipo_proveedor?:string,
               public ciudad?: string,
               //public colegio?: Colegio,
               public exists: boolean = false
               ) {}

}
