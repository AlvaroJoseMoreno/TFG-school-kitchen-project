import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';
import Swal from 'sweetalert2';

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
  public wait_form = false;

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

  displayedColumns: string[] = ['Nombre', 'Categoria', 'Medida', 'Precio', 'borrar'];

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
    this.wait_form = true;
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
      this.wait_form = false;
    }, (err) => {
      this.wait_form = false;
    });
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrarIngrediente(uid: any, name: string) {
    Swal.fire({
      title: 'Eliminar ingrediente',
      text: `Al eliminar el ingrediente ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.ingredienteservicio.borrarIngrediente(uid)
              .subscribe(resp => {
                this.getIngredientes();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  borrar() {
    this.searchForm.controls['texto'].reset();
  }

}
