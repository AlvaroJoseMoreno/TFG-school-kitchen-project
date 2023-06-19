import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Plato } from 'src/app/modelos/plato.model';
import { PlatoService } from 'src/app/servicios/plato.service';
import { Colegio } from 'src/app/modelos/colegio.model';
import { ColegioService } from 'src/app/servicios/colegio.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { FicherosService } from 'src/app/servicios/ficheros.service';

@Component({
  selector: 'app-platos',
  templateUrl: './platos.component.html',
  styleUrls: ['./platos.component.css']
})
export class PlatosComponent implements OnInit {

  public platos: Plato [] = [];
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
    texto: [''],
    colegio: ['']
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

  constructor(private colegioservicio: ColegioService,
              private platoServicio: PlatoService,
              private ficheroservicio: FicherosService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder,
              private dialog: MatDialog) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getColegios();
    this.getPlatos();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getPlatos();
      });
  }

  private filtro(): Colegio[] {
    return this.colegios.filter(option => option.nombre!.toLowerCase().includes(this.searchForm.value.colegio.toLowerCase()));
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

  getPlatos(){
    const texto = this.searchForm.get('texto')?.value || '';
    const colegio = this.obtainColegioId() || '';

    if(this.searchForm.get('colegio')?.value.length > 0 && colegio == '') { return; }
    this.wait_form = true;
    this.platoServicio.getPlatos(texto, colegio).subscribe((res: any) => {
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
    this.searchForm.controls['colegio'].setValue('');
  }

  imagenUrl(nombre: string){
    return this.ficheroservicio.crearImagenUrl('fotoingrediente', nombre);
  }

  openDetails(id: string){

    this.platoServicio.getPlato(id).subscribe((res:any) => {
      const plato = res['platos'];
      let imagenes = [];
      for(let i = 0; i < plato.ingredientes.length; i++){
        imagenes.push(plato.ingredientes[i].imagen);
      }
      this.dialog.open(IngredientesPlatos, {
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
  selector: 'platos-ingredientes',
  templateUrl: 'platos-ingredientes.html',
  styleUrls: ['platos.component.css']
})
export class IngredientesPlatos {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
