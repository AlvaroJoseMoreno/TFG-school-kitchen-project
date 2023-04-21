import { Component, OnInit, ViewChild } from '@angular/core';
import { SidebarService } from 'src/app/servicios/sidebar.service';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  constructor(private sidebarservicio: SidebarService) { }

  ngOnInit(): void {
    this.getMenu();
  }

  getMenu(){
    this.sidebarservicio.getMenu();
  }
  close(reason?: string) {
    this.sidenav.close();
  }

  procesaPropagar(event: any) {
    if(this.sidenav.mode == 'over'){
      this.sidenav.mode = 'side';
      this.sidenav.close();
      console.log('Paso por aquí: ', this.sidenav.mode);
    } else {
      this.sidenav.mode = 'over';
      this.sidenav.open();
      console.log('Paso por aquí: ', this.sidenav.mode);
    }
  }

}
