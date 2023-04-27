import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UsuarioService } from '../servicios/usuario.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NoauthGuard implements CanActivate {
  constructor( private userservice: UsuarioService,
    private router: Router) {}

canActivate(
            next: ActivatedRouteSnapshot,
            state: RouterStateSnapshot) {
  return this.userservice.validarNoToken()
    .pipe(tap( resp => {
        if(!resp){
          console.log('No auth guard: ', resp);
          switch (this.userservice.rol) {
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
      })
    );
  }
}
