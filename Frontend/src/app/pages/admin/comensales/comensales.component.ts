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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comensales',
  templateUrl: './comensales.component.html',
  styleUrls: ['./comensales.component.css']
})
export class ComensalesComponent implements OnInit {

  public comensales: Comensal [] = [];
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
    fecha: [''],
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

  displayedColumns: string[] = ['Fecha', 'Comensales', 'Colegio', 'Usuario', 'borrar'];

  constructor(private comensaleservicio: ComensalService,
              private colegioservicio: ColegioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getColegios();
    this.getComensales();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getComensales();
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

  getComensales(){
    const texto = this.searchForm.get('fecha')?.value || undefined;
    const colegio = this.obtainColegioId();

    if(this.searchForm.get('colegio')?.value.length > 0 && colegio == '') { return; }
    this.wait_form = true;
    this.comensaleservicio.getComensales(texto, colegio).subscribe((res: any) => {
      this.comensales = res['comensales'];
      this.length = res['comensales'].length;
      this.dataSource = new MatTableDataSource<Comensal>(this.comensales);
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

  borrarComensales(uid: any, dia: Date, colegio: string) {
    let day = new Date(dia).toLocaleDateString();
    Swal.fire({
      title: 'Eliminar registro de comensales',
      text: `Al eliminar el registro de comensales del día ${day} del colegio ${colegio} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.comensaleservicio.borrarComensales(uid)
              .subscribe( resp => {
                this.getComensales();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
  }

  borrar() {
    this.searchForm.controls['fecha'].reset();
    this.searchForm.controls['colegio'].setValue('');
  }

}
