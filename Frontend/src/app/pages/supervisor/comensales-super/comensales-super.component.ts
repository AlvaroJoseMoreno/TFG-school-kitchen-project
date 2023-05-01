import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Comensal } from 'src/app/modelos/comensal.model';
import { ComensalService } from 'src/app/servicios/comensal.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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

  displayedColumns: string[] = ['Fecha', 'Comensales', 'Colegio', 'Usuario'];

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

    this.comensaleservicio.getComensales(texto, this.usuarioservice.uid).subscribe((res: any) => {
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
      console.log(res);
    });
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrar() {
    this.searchForm.controls['fecha'].reset();
  }

}
