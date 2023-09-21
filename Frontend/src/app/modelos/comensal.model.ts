import { environment } from '../../environments/environment';
import { Colegio } from './colegio.model';
import { Usuario } from './usuario.model';

export class Comensal {

  constructor(
               public uid: string,
               public fecha: Date,
               public colegio: Colegio,
               public num_comensales: number,
               public registrado_por: Usuario,
              ) {}

}
