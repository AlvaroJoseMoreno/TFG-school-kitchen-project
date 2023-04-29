import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Colegio } from 'src/app/modelos/colegio.model';
import { ColegioService } from 'src/app/servicios/colegio.service';
import { Pedido } from 'src/app/modelos/pedido.model';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.css']
})
export class PedidosComponent implements OnInit {

  public pedidos: Pedido [] = [];
  public colegios: Colegio [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public dataSource2: any;
  public filterColegio = new FormControl();
  public filteredOptions!: Observable<Colegio[]>;

  public searchForm = this.fb.group({
    texto: [''],
    colegio: [''],
    estado: ['']
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

  displayedColumns: string[] = ['Nombre', 'Fecha_pedido', 'Fecha_esperada', 'Proveedor', 'Usuario_pedido', 'Estado', 'Colegio', 'Ingredientes', 'Precio'];

  constructor(private colegioservicio: ColegioService,
              private pedidosservicio: PedidoService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder,
              public dialog: MatDialog) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getColegios();
    this.getPedidos();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getPedidos();
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

  getPedidos(){
    const texto = this.searchForm.get('texto')?.value || '';
    const colegio = this.obtainColegioId() || '';
    const estado = this.searchForm.get('estado')?.value || '';

    if(this.searchForm.get('colegio')?.value.length > 0 && colegio == '') { return; }

    this.pedidosservicio.getPedidos(texto, colegio, estado).subscribe((res: any) => {
        this.pedidos = res['pedidos'];
        this.length = res['pedidos'].length;
        this.dataSource = new MatTableDataSource<Pedido>(this.pedidos);
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

  borrar() {
    this.searchForm.controls['texto'].reset();
    this.searchForm.controls['colegio'].setValue('');
    this.searchForm.controls['estado'].setValue('');
  }

  openDetails(id: string){

    this.pedidosservicio.getPedido(id).subscribe((res:any) => {
      const pedido = res['pedidos'];
      console.log(pedido)
      this.dialog.open(IngredientesPedidos, {
        data: {
          pedido,
          service: this,
        },
      });

    }, (err) => {
      console.log(err);
    });
  }

}

  @Component({
    selector: 'pedidos-ingredientes',
    templateUrl: 'pedidos-ingredientes.html',
    styleUrls: ['./pedidos.component.css']
  })
  export class IngredientesPedidos {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  }

