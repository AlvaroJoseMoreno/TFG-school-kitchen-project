import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { UsuarioService } from '../servicios/usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( private usuarioService: UsuarioService,
               private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      return this.usuarioService.validarToken()
              .pipe(
                tap( resp => {
                  console.log(resp);
                  // Si devuelve falso, el token no es bueno, salimos a login
                  if (!resp) {
                    this.router.navigateByUrl('/login');
                  } else {
                    // Si la ruta no es para el rol del token, reenviamos a ruta base de rol del token
                    if ((next.data.rol !== '*') && (this.usuarioService.rol !== next.data.rol)) {
                      switch (this.usuarioService.rol) {
                        case 'ROL_ADMIN':
                          this.router.navigateByUrl('/admin/dashboard');
                          break;
                        case 'ROL_SUPERVISOR':
                          this.router.navigateByUrl('/super/dashboard');
                          break;
                        case 'ROL_COCINERO':
                          this.router.navigateByUrl('/cocinero/dashboard');
                          break;
                        case 'ROL_PROVEEDOR':
                          this.router.navigateByUrl('/prov/dashboard');
                          break;
                      }
                   }
                  }
                })
              );
  }

}
