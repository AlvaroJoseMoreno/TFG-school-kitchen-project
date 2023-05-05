import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';

@Component({
  selector: 'app-ingredientes-proveedor',
  templateUrl: './ingredientes-proveedor.component.html',
  styleUrls: ['./ingredientes-proveedor.component.css']
})
export class IngredientesProveedorComponent implements OnInit {

  public ingredientes: Ingrediente [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;

  public searchForm = this.fb.group({
    texto: ['']
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

  displayedColumns: string[] = ['Nombre', 'Proveedor', 'Categoria', 'Medida', 'Precio', 'Alergenos', 'Stock'];

  constructor(private ingredienteservicio: IngredienteService,
              private usuarioservicio: UsuarioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getIngredientes();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getIngredientes();
      });
  }

  getIngredientes(){
    const texto = this.searchForm.get('texto')?.value || '';

    this.ingredienteservicio.getIngredientes(texto, this.usuarioservicio.uid).subscribe((res: any) => {
        this.ingredientes = res['ingredientes'];
        this.length = res['ingredientes'].length;
        this.dataSource = new MatTableDataSource<Ingrediente>(this.ingredientes);
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
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrar() {
    this.searchForm.controls['texto'].reset();
  }

}
