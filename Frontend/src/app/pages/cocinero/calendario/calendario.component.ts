import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/app/servicios/menu.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  private uid: string = '';
  private day: Date | null = null;

  constructor(
    private menuservicio: MenuService,
    private usuarioservicio: UsuarioService
  ) { }

  ngOnInit(): void {
    this.uid = this.usuarioservicio.uid;
    this.day = new Date();
    let currentDate = this.day.toISOString().substring(0,10);
    this.getMenuByDay(currentDate);
  }

  public getMenuByDay(currentDate: string){
    this.menuservicio.getMenus(currentDate, this.usuarioservicio.colegio, 'estandar').subscribe((res: any) => {
      console.log(res);
    }, (err) => {
      console.log(err);
    })
  }

}
