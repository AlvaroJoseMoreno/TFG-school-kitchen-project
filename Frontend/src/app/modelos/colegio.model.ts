import { environment } from '../../environments/environment';
import { Provincia } from './provincia.model';

export class Colegio {

  constructor(
               public uid: string,
               public nombre: string,
               public direccion?: string,
               public telefono?: string,
               public provincia?: Provincia,
               ) {}

}
