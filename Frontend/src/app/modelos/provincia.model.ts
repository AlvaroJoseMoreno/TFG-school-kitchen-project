import { environment } from '../../environments/environment';

export class Provincia {

  constructor(
               public uid: string,
               public nombre: string,
               public codigo?: string,
               public num_colegios?: number,
              ) {}

}
