import { environment } from '../../environments/environment';
import { Usuario } from './usuario.model';

export class Ingrediente {

  constructor(
               public uid: string,
               public nombre: string,
               public medida: string,
               public precio: number,
               public alergenos: string [],
               public foto: string,
               public proveedor: Usuario,
               public stock_actual: number,
               ) {}

}
