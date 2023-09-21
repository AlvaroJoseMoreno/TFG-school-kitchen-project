import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Comensal } from 'src/app/modelos/comensal.model';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { ComensalService } from 'src/app/servicios/comensal.service';
import { ColegioService } from 'src/app/servicios/colegio.service';
import { Colegio } from 'src/app/modelos/colegio.model';
import { Menu } from 'src/app/modelos/menu.model';
import { MenuService } from 'src/app/servicios/menu.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {

  public menus: Menu [] = [];
  public colegios: Colegio [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public filterColegio = new FormControl();
  public filteredOptions!: Observable<Colegio[]>;
  public wait_form = false;

  public searchForm = this.fb.group({
    dia: [''],
    colegio: [''],
    tipo: ['']
  });

  public subs$!: Subscription;

  public hidePageSize = false;
  public showPageSizeOptions = true;
  public showFirstLastButtons = true;
  public disabled = false;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  public pageEvent: PageEvent | undefined;

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  displayedColumns: string[] = ['Dia', 'Plato1', 'Plato2', 'Ensalada', 'Postre', 'Colegio', 'Coste', 'borrar'];

  constructor(private menuservicio: MenuService,
              private colegioservicio: ColegioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getColegios();
    this.getMenus();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getMenus();
      });
  }

  private filtro(): Colegio[] {
    return this.colegios.filter(option => option.nombre.toLowerCase().includes(this.searchForm.value.colegio.toLowerCase()));
  }

  getColegios() {
    this.colegioservicio.getColegios('', '').subscribe((res: any) => {
      console.log(res);
      this.colegios = res['colegios'];
      this.filteredOptions = this.filterColegio.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  getMenus(){
    const dia = this.searchForm.get('dia')?.value || undefined;
    const colegio = this.obtainColegioId();
    const tipo = this.searchForm.get('tipo')?.value || '';
    if(this.searchForm.get('colegio')?.value.length > 0 && colegio == '') { return; }
    this.wait_form = true;
    this.menuservicio.getMenus(dia, colegio, tipo).subscribe((res: any) => {
      this.menus = res['menus'];
      this.length = this.menus.length;
      this.dataSource = new MatTableDataSource<Menu>(this.menus);
      this.dataSource.paginator = this.paginator;
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      const start = page * pageSize + 1;
      let end = (page + 1) * pageSize;
      if(end > length)
        end = length
        return `página ${start} - ${end} de ${length}`;
      };
      this.wait_form = false;
    }, (err) =>{
      this.wait_form = false;
    });
  }

  obtainColegioId(): string {
    let col = '';
    let bool = false;
    for(let x = 0; x < this.colegios.length; x++){
      if(this.colegios[x].nombre === this.searchForm.get('colegio')?.value){
        bool = true;
        this.searchForm.value.colegio = this.colegios[x].uid;
        break;
      }
    }
    if(this.searchForm.get('colegio')?.value.length > 0 && !bool) { return ''; }

    if(bool){
      col = this.searchForm.value.colegio;
    }
    return col;
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrarMenu(uid: any, name: string) {
    Swal.fire({
      title: 'Eliminar menu',
      text: `Al eliminar el menú ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.menuservicio.borrarMenu(uid)
              .subscribe( resp => {
                this.getMenus();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  borrar() {
    this.searchForm.controls['dia'].reset();
    this.searchForm.controls['colegio'].setValue('');
    this.searchForm.controls['tipo'].setValue('');
  }
}
