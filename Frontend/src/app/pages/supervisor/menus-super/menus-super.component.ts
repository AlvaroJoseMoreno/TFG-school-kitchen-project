import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Menu } from 'src/app/modelos/menu.model';
import { MenuService } from 'src/app/servicios/menu.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-menus-super',
  templateUrl: './menus-super.component.html',
  styleUrls: ['./menus-super.component.css']
})
export class MenusSuperComponent implements OnInit {

  public menus: Menu [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;

  public searchForm = this.fb.group({
    dia: [''],
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
              private usuarioservicio: UsuarioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getMenus();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getMenus();
      });
  }

  getMenus(){
    const dia = this.searchForm.get('dia')?.value || undefined;
    const tipo = this.searchForm.get('tipo')?.value || '';

    this.menuservicio.getMenus(dia, this.usuarioservicio.colegio, tipo).subscribe((res: any) => {
        this.menus = res['menus'];
        this.length = res['menus'].length;
        this.dataSource = new MatTableDataSource<Menu>(this.menus);
        this.dataSource.paginator = this.paginator;
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          const start = page * pageSize + 1;
          let end = (page + 1) * pageSize;

          if(end > length)
            end = length

          return `página ${start} - ${end} de ${length}`;
        };
    });
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
    this.searchForm.controls['tipo'].setValue('');
  }
}
