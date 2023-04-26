import { Colegio } from './colegio.model';
import { Ingrediente } from './ingrediente.model';
import { Usuario } from './usuario.model';

export class Pedido {

  constructor(
               public uid: string,
               public nombre: string,
               public fecha_pedido: Date,
               public proveedor: Usuario,
               public estado: string,
               public ingredientes: Ingrediente [],
               public cantidad_ing: number [],
               public precio: number,
               public usuario_pedido: Usuario,
               public colegio: Colegio,
               public fecha_esperada?: Date,
               public anotaciones?: string
               ) {}

}
