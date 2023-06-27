import { Component, OnInit,ViewChild, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Plato } from '../../../modelos/plato.model';
import { MenuService } from '../../../servicios/menu.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { Ingrediente } from '../../../modelos/ingrediente.model';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FicherosService } from '../../../servicios/ficheros.service';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioComponent implements OnInit {

  private day: Date | null = null;
  public type_menu: string = 'estandar';
  public selected_day: string = '';
  public there_menu: boolean = false;
  public waiting: boolean = false;
  public plato1: Plato | null = null;
  public plato2: Plato | null = null;
  public ensalada: Plato | null = null;
  public postre: Ingrediente | null = null;
  public es_festivo: boolean = false;

  public datosForm = this.formbuilder.group({
    dia: [''],
  });

  constructor(
    private menuservicio: MenuService,
    private usuarioservicio: UsuarioService,
    private ficheroservicio: FicherosService,
    private formbuilder: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.day = new Date();
    let currentDate = this.day.toISOString().substring(0,10);
    this.formatedDay();
    this.getMenuByDay();
    this.datosForm.get('dia')?.setValue(currentDate);
  }

  public getMenuByDay(){
    let currentDate = this.day?.toISOString().substring(0,10);
    this.waiting = true;
    this.menuservicio.getMenus(currentDate, this.usuarioservicio.colegio, this.type_menu).subscribe((res: any) => {
      console.log(res);
      if(res['total'] === 0){
        this.there_menu = false;
      } else if(res['total'] === 1){
        this.there_menu = true;
        this.plato1 = res['menus'][0].plato1;
        this.plato2 = res['menus'][0].plato2;
        this.ensalada = res['menus'][0].ensalada;
        this.postre = res['menus'][0].postre;
      }
      this.waiting = false;
    }, (err) => {
      console.log(err);
    })
  }

  changeDay() {
    this.day = new Date(this.datosForm.get('dia')?.value);
    this.formatedDay();
    this.getMenuByDay();
  }

  public formatedDay() {
    let date = this.day;
    this.selected_day = '';
    this.selected_day += this.nameDay(date) + date?.getDate() + ' de ' + this.nameMonth(date) + date?.getFullYear();
  }

  nameDay(date: Date | null): string {
    this.es_festivo = false;
    switch (date?.toDateString().substring(0,3)) {
      case 'Mon':
        return 'Lunes, ';
      case 'Tue':
        return 'Martes, ';
      case 'Wed':
        return 'Miércoles, ';
      case 'Thu':
        return 'Jueves, ';
      case 'Fri':
        return 'Viernes, ';
      case 'Sat':
        this.es_festivo = true;
        return 'Sábado, ';
      case 'Sun':
        this.es_festivo = true;
        return 'Domingo, ';
      default:
        break;
    }
    return '';
  }

  nameMonth(date: Date | null): string {
    switch (date?.toDateString().substring(4,7)) {
      case 'Jan':
        return 'Enero de ';
      case 'Feb':
        return 'Febrero de ';
      case 'Mar':
        return 'Marzo de ';
      case 'Apr':
        return 'Abril de ';
      case 'May':
        return 'Mayo de ';
      case 'Jun':
        return 'Junio de ';
      case 'Jul':
        return 'Julio de ';
      case 'Aug':
        return 'Agosto de ';
      case 'Sep':
        return 'Septiembre de ';
      case 'Oct':
        return 'Octubre de ';
      case 'Nov':
        return 'Noviembre de ';
      case 'Dec ':
        return 'Diciembre de ';
      default:
        break;
    }
    return '';
  }

  upDay(){
    this.day?.setDate(this.day?.getDate() + 1);
    let currentDate = this.day?.toISOString().substring(0,10);
    this.datosForm.get('dia')?.setValue(currentDate);
    this.formatedDay();
    this.changeTypeMenu('estandar');
    this.getMenuByDay();
  }

  downDay() {
    this.day?.setDate(this.day?.getDate() - 1);
    let currentDate = this.day?.toISOString().substring(0,10);
    this.datosForm.get('dia')?.setValue(currentDate);
    this.formatedDay();
    this.changeTypeMenu('estandar');
    this.getMenuByDay();
  }

  changeTypeMenu(tipo: string){
    this.type_menu = tipo === 'estandar' ? 'estandar' : 'alergicos';
    this.getMenuByDay();
  }

  imagenUrl(nombre: string){
    return this.ficheroservicio.crearImagenUrl('fotoingrediente',nombre);
  }

  comprobarAlergenos(alergenos: string []): string {
    let cadena = '';
    if(alergenos.length === 0) {
      cadena = 'Este plato no tiene alérgenos';
    } else {
      for(let i = 0; i < alergenos.length; i++){
        if(i != alergenos.length - 1){
          cadena += alergenos[i] + ', '
        } else {
          cadena += alergenos[i] + '.'
        }
      }
    }
    return cadena;
  }

  openDetails(tipo: string){
    let plato = this.plato1;
    if(tipo === 'plato2') {
      plato = this.plato2;
    } else if(tipo === 'ensalada') {
      plato = this.ensalada;
    }
    let imagenes = [];
    if(plato?.ingredientes.length != undefined){
      for(let i = 0; i < plato?.ingredientes.length; i++) {
        imagenes.push(plato.ingredientes[i]?.imagen);
      }
    }
    this.dialog.open(CalendarioDetalles, {
      data: {
        plato,
        service: this,
        imagenes
      },
    });
  }

}

@Component({
  selector: 'calendario-detalles',
  templateUrl: './calendario-detalles.html',
  styleUrls: ['./calendario.component.css']
})
export class CalendarioDetalles {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}

}
