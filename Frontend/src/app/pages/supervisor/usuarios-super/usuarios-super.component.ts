import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/modelos/usuario.model';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-usuarios-super',
  templateUrl: './usuarios-super.component.html',
  styleUrls: ['./usuarios-super.component.css']
})
export class UsuariosSuperComponent implements OnInit {

  public usuarios: Usuario [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;

  public searchForm = this.fb.group({
    text: [''],
    rol: ['']
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

  displayedColumns: string[] = ['Nombre', 'Email', 'Rol', 'Colegio'];

  constructor(private usuarioservicio: UsuarioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getUsuarios();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getUsuarios();
      });
  }

  getUsuarios(){
    const texto = this.searchForm.get('text')?.value || '';
    const rol = this.searchForm.get('rol')?.value || '';

    this.usuarioservicio.getUsuarios(texto, rol, this.usuarioservicio.colegio).subscribe((res: any) => {
        console.log(res);
        this.usuarios = res['usuarios'];
        this.length = res['usuarios'].length;
        this.dataSource = new MatTableDataSource<Usuario>(this.usuarios);
        this.dataSource.paginator = this.paginator;
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          const start = page * pageSize + 1;
          let end = (page + 1) * pageSize;

          if(end > length)
            end = length

          return `página ${start} - ${end} de ${length}`;
        };
      console.log(res);
    });
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => + str);
    }
  }

  borrar() {
    this.searchForm.controls['text'].reset();
    this.searchForm.controls['rol'].setValue('');
  }

}
