import { Colegio } from './colegio.model';
import { Ingrediente } from './ingrediente.model';

export class Plato {

  constructor(
               public uid: string,
               public nombre: string,
               public categoria: string,
               public coste: number,
               public ingredientes: Ingrediente [],
               public cantidad_ing: number [],
               public alergenos: string [],
               public colegio: Colegio,
               public receta?: string
               ) {}

}
