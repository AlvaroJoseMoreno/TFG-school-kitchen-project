import { Component, OnInit, ViewChild } from '@angular/core';
import { SidebarService } from 'src/app/servicios/sidebar.service';
import { MatSidenav } from '@angular/material/sidenav';
import { sidebarItem } from 'src/app/interfaces/sidebar.interface';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild(MatSidenav)
  public sidenav!: MatSidenav;
  public menuItem: sidebarItem[] = [];
  public rol: string = '';
  constructor(private sidebarservicio: SidebarService,
              private usuarioServio: UsuarioService) { }

  ngOnInit(): void {
    this.menuItem = this.getMenu();
    // this.menuItem = [
    //   { title: 'Dashboard', icon: 'fa fa-home', sub: false, url: '/admin'},
    //   { title: 'Usuarios', icon: 'fa fa-users', sub: false, url: '/admin/usuarios'},
    //   { title: 'Colegios', icon: 'fa fa-school', sub: false, url: '/admin/colegios'},
    //   { title: 'Pedidos', icon: 'fa fa-clipboard-list', sub: false, url: '/admin/pedidos'},
    //   { title: 'Ingredientes', icon: 'fa fa-carrot', sub: false, url: '/admin/ingredientes'},
    //   { title: 'Menus', icon: 'fa fa-burger', sub: false, url: '/admin/menus'},
    //   { title: 'Platos', icon: 'fa fa-utensils', sub: false, url: '/admin/platos'},
    //   { title: 'Comensales', icon: 'fa-solid fa-user', sub: false, url: '/admin/comensales'},
    //   { title: 'Provincias', icon: 'fas fa-route-interstate', sub: false, url: '/admin/provincias'}
    // ];
    console.log(this.menuItem);
    this.initComp();
    this.rol = this.usuarioServio.rol;
  }

  initComp(){
    let that = this;
    setTimeout(function(){
      that.close();
    },100);
  }

  getMenu(){
    return this.sidebarservicio.getMenu();
  }

  close(reason?: string) {
    this.sidenav.mode = 'side';
    this.sidenav.close();
  }

  procesaPropagar(event: any) {
    if(this.sidenav.mode == 'over'){
      this.sidenav.mode = 'side';
      this.sidenav.close();
    } else {
      this.sidenav.mode = 'over';
      this.sidenav.open();
    }
  }

}
