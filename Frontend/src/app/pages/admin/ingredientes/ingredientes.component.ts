import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { Usuario } from 'src/app/modelos/usuario.model';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ingredientes',
  templateUrl: './ingredientes.component.html',
  styleUrls: ['./ingredientes.component.css']
})

export class IngredientesComponent implements OnInit {

  public ingredientes: Ingrediente [] = [];
  public proveedores: Usuario [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public filterProveedor = new FormControl();
  public filteredOptions!: Observable<Usuario[]>;
  public wait_form = false;

  public searchForm = this.fb.group({
    texto: [''],
    proveedor: ['']
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

  displayedColumns: string[] = ['Nombre', 'Proveedor', 'Categoria', 'Medida', 'Precio', 'Alergenos', 'Stock', 'borrar'];

  constructor(private ingredienteservicio: IngredienteService,
              private usuarioservicio: UsuarioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getUsuarios();
    this.getIngredientes();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getIngredientes();
      });
  }

  private filtro(): Usuario[] {
    return this.proveedores.filter(option => option.nombre!.toLowerCase().includes(this.searchForm.value.proveedor.toLowerCase()));
  }

  getUsuarios() {
    this.usuarioservicio.getUsuarios('', 'ROL_PROVEEDOR', '').subscribe((res: any) => {
      console.log(res);
      this.proveedores = res['usuarios'];
      this.filteredOptions = this.filterProveedor.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  getIngredientes(){
    const texto = this.searchForm.get('texto')?.value || '';
    const proveedor = this.obtainProveedorId();
    if(this.searchForm.get('proveedor')?.value.length > 0 && proveedor == '') { return; }
    this.wait_form = true;
    this.ingredienteservicio.getIngredientes(texto, proveedor).subscribe((res: any) => {
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
    });
  }

  obtainProveedorId(): string {
    let col = '';
    let bool = false;
    for(let x = 0; x < this.proveedores.length; x++){
      if(this.proveedores[x].nombre === this.searchForm.get('proveedor')?.value){
        bool = true;
        this.searchForm.value.proveedor = this.proveedores[x].uid;
        break;
      }
    }
    if(this.searchForm.get('proveedor')?.value.length > 0 && !bool) { return ''; }

    if(bool){
      col = this.searchForm.value.proveedor;
    }
    return col;
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
              .subscribe( resp => {
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
    this.searchForm.controls['proveedor'].setValue('');
  }

}
