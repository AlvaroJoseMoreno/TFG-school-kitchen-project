import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { ColegioService } from 'src/app/servicios/colegio.service';
import { Colegio } from 'src/app/modelos/colegio.model';
import { ProvinciaService } from 'src/app/servicios/provincia.service';
import { Provincia } from 'src/app/modelos/provincia.model';

@Component({
  selector: 'app-colegios-admin',
  templateUrl: './colegios.component.html',
  styleUrls: ['./colegios.component.css']
})
export class ColegiosComponent implements OnInit {

  public colegios: Colegio [] =  [];
  public provincias: Provincia [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public filterProvince = new FormControl();
  public filteredOptions!: Observable<Provincia[]>;

  public searchForm = this.fb.group({
    text: [''],
    provincia: ['']
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

  displayedColumns: string[] = ['Nombre', 'Provincia', 'Telefono', 'Direccion'];

  constructor(private colegioservicio: ColegioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder,
              private provinciaservicio: ProvinciaService) {
                this.paginator1.itemsPerPageLabel = "Registros por página";

               }

  ngOnInit(): void {
    this.getProvincias();
    this.getColegios();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getColegios();
      });
  }

  private filtro(): Provincia[] {
    return this.provincias.filter(option => option.nombre.toLowerCase().includes(this.searchForm.value.provincia.toLowerCase()));
  }

  getProvincias() {
    this.provinciaservicio.getProvincias('').subscribe((res: any) => {
      console.log(res);
      this.provincias = res['provincias'];
      this.filteredOptions = this.filterProvince.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  getColegios(){
    const texto = this.searchForm.get('text')?.value || '';
    const provincia = this.obtainProvinceId();

    if(this.searchForm.get('provincia')?.value.length > 0 && provincia == '') { return; }

    this.colegioservicio.getColegios(texto, provincia).subscribe((res: any) => {
        this.colegios = res['colegios'];
        this.length = res['colegios'].length;
        this.dataSource = new MatTableDataSource<Colegio>(this.colegios);
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

  obtainProvinceId(): string {
    let prov = '';
    let bool = false;
    for(let x = 0; x < this.provincias.length; x++){
      if(this.provincias[x].nombre === this.searchForm.get('provincia')?.value){
        bool = true;
        this.searchForm.value.provincia = this.provincias[x].uid;
        break;
      }
    }
    if(this.searchForm.get('provincia')?.value.length > 0 && !bool) { return ''; }

    if(bool){
      prov = this.searchForm.value.provincia;
    }
    return prov;
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrar() {
    this.searchForm.controls['text'].reset();
    this.searchForm.controls['provincia'].setValue('');
  }

}
