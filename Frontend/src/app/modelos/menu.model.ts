import { environment } from '../../environments/environment';
import { Colegio } from './colegio.model';
import { Ingrediente } from './ingrediente.model';
import { Plato } from './plato.model';

export class Menu {

  constructor(
               public uid: string,
               public nombre: string,
               public dia: Date,
               public plato1: Plato,
               public plato2: Plato,
               public ensalada: Plato,
               public postre: Ingrediente,
               public colegio: Colegio,
               public coste: number,
               public anotaciones?: string
               ) {}

}
