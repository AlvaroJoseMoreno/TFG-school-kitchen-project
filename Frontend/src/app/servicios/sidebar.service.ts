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
    { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/prov'},
    { title: 'Pedidos', icon: 'fa fa-clipboard-list', sub: false, url: '/prov/pedidos'},
    { title: 'Ingredientes', icon: 'fa fa-carrot', sub: false, url: '/prov/ingredientes'},
  ];

  menuCocinero: sidebarItem [] = [
    { title: 'Calendario', icon: 'fa fa-calendar', sub: false, url: '/cocinero/calendario'},
    // { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/cocinero'},
    { title: 'Pedidos', icon: 'fa fa-clipboard-list', sub: false, url: '/cocinero/pedidos'},
    { title: 'Comensales', icon: 'fa-solid fa-user', sub: false, url: '/cocinero/comensales'}
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
