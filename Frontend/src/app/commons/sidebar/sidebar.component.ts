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
