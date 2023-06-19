import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Comensal } from 'src/app/modelos/comensal.model';
import { ComensalService } from 'src/app/servicios/comensal.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comensales-super',
  templateUrl: './comensales-super.component.html',
  styleUrls: ['./comensales-super.component.css']
})
export class ComensalesSuperComponent implements OnInit {

  public comensales: Comensal [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public wait_form = false;

  public searchForm = this.fb.group({
    fecha: ['']
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
              private usuarioservice: UsuarioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getComensales();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getComensales();
      });
  }

  getComensales(){
    const texto = this.searchForm.get('fecha')?.value || undefined;
    this.wait_form = true;
    this.comensaleservicio.getComensales(texto, this.usuarioservice.colegio).subscribe((res: any) => {
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
  }

}
