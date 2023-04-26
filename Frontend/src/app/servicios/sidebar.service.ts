import { Injectable } from '@angular/core';
import { sidebarItem } from '../interfaces/sidebar.interface';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root'
})

export class SidebarService {

  menuAdmin: sidebarItem [] = [
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/admin'},
    { title: 'Usuarios', icon: 'fa fa-users', sub: false, url: '/admin/usuarios'},
    { title: 'Colegios', icon: 'fa fa-school', sub: false, url: '/admin/colegios'},
    { title: 'Pedidos', icon: 'fa fa-clipboard-list', sub: false, url: '/admin/pedidos'},
    { title: 'Ingredientes', icon: 'fa fa-carrot', sub: false, url: '/admin/ingredientes'},
    { title: 'Menus', icon: 'fa fa-burger', sub: false, url: '/admin/menus'},
    { title: 'Platos', icon: 'fa fa-utensils', sub: false, url: '/admin/platos'},
    { title: 'Comensales', icon: 'fa-solid fa-user', sub: false, url: '/admin/comensales'},
    { title: 'Provincias', icon: 'fas fa-route-interstate', sub: false, url: '/admin/provincias'}
  ];

  menuSupervisor: sidebarItem [] = [
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/super'},
    { title: 'Usuarios', icon: 'fa fa-users', sub: false, url: '/super/usuarios'},
    { title: 'Pedidos', icon: 'fa fa-clipboard-list', sub: false, url: '/super/pedidos'},
    { title: 'Menus', icon: 'fa fa-burger', sub: false, url: '/super/menus'},
    { title: 'Platos', icon: 'fa fa-utensils', sub: false, url: '/super/platos'},
    { title: 'Comensales', icon: 'fa-solid fa-user', sub: false, url: '/super/comensales'}
  ];

  menuProveedor: sidebarItem [] = [
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/commerce'},
    { title: 'Mis comercios', icon: 'zmdi zmdi-shopping-cart', sub: false, url: '/commerce/comercios'},
    { title: 'Mis valoraciones', icon: 'fas fa-star', sub: false, url: '/commerce/reviews'},
    { title: 'Suscripción', icon: 'zmdi zmdi-money', sub: false, url: '/commerce/payment'},
    { title: 'Mis facturas', icon: 'fas fa-money-bill', sub: false, url: '/commerce/bill'},
    { title: 'Mi perfil', icon: 'fa fa-users', sub: false, url: '/commerce/profile'},
  ];

  menuCocinero: sidebarItem [] = [
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/commerce'},
    { title: 'Mis comercios', icon: 'zmdi zmdi-shopping-cart', sub: false, url: '/commerce/comercios'},
    { title: 'Mis valoraciones', icon: 'fas fa-star', sub: false, url: '/commerce/reviews'},
    { title: 'Suscripción', icon: 'zmdi zmdi-money', sub: false, url: '/commerce/payment'},
    { title: 'Mis facturas', icon: 'fas fa-money-bill', sub: false, url: '/commerce/bill'},
    { title: 'Mi perfil', icon: 'fa fa-users', sub: false, url: '/commerce/profile'},
  ];

  none: sidebarItem [] = [
    { title: 'error', icon: 'fa fa-exclamation-triangle', sub: false, url: '/error'}
  ]

  constructor(private usuarioservicio: UsuarioService) { }

  getMenu(){
    console.log(this.usuarioservicio);
    switch (this.usuarioservicio.rol) {
      case 'ROL_ADMIN':
        return this.menuAdmin;
      case 'ROL_SUPERVISOR':
        return this.menuSupervisor;
      case 'ROL_PROVEEDOR':
        return this.menuProveedor;
      case 'ROL_COCINERO':
        return this.menuCocinero;
    }

    return this.none;
  }

}
