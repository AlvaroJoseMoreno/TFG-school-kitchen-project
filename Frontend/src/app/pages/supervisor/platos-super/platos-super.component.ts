import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Plato } from 'src/app/modelos/plato.model';
import { Subscription } from 'rxjs';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { PlatoService } from 'src/app/servicios/plato.service';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { FicherosService } from 'src/app/servicios/ficheros.service';

@Component({
  selector: 'app-platos-super',
  templateUrl: './platos-super.component.html',
  styleUrls: ['./platos-super.component.css']
})
export class PlatosSuperComponent implements OnInit {

  public platos: Plato [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;

  public searchForm = this.fb.group({
    texto: [''],
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

  displayedColumns: string[] = ['Nombre', 'Categoria', 'Colegio', 'Ingredientes', 'Coste', 'borrar'];

  constructor(private usuarioservicio: UsuarioService,
              private platoServicio: PlatoService,
              private ficheroservicio: FicherosService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder,
              private dialog: MatDialog) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getPlatos();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getPlatos();
      });
  }

  getPlatos(){
    const texto = this.searchForm.get('texto')?.value || '';

    this.platoServicio.getPlatos(texto, this.usuarioservicio.colegio).subscribe((res: any) => {
        this.platos = res['platos'];
        this.length = res['platos'].length;
        this.dataSource = new MatTableDataSource<Plato>(this.platos);
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

  borrarPlato(uid: any, name: string) {
    Swal.fire({
      title: 'Eliminar plato',
      text: `Al eliminar el plato ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.platoServicio.borrarPlato(uid)
              .subscribe( resp => {
                this.getPlatos();
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

  imagenUrl(nombre: string){
    return this.ficheroservicio.crearImagenUrl('fotoingrediente',nombre);
  }

  openDetails(id: string){

    this.platoServicio.getPlato(id).subscribe((res:any) => {
      const plato = res['platos'];
      let imagenes = [];
      for(let i = 0; i < plato.ingredientes.length; i++){
        imagenes.push(plato.ingredientes[i].imagen);
      }
      console.log(plato)
      this.dialog.open(IngredientesSuperPlatos, {
        data: {
          plato,
          service: this,
          imagenes
        },
      });

    }, (err) => {
      console.log(err);
    });
  }

}

@Component({
  selector: 'platos-super-ingredientes',
  templateUrl: './platos-super-ingredientes.html',
  styleUrls: ['platos-super.component.css']
})

export class IngredientesSuperPlatos {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
