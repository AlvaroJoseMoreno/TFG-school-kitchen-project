import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Pedido } from 'src/app/modelos/pedido.model';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { FicherosService } from 'src/app/servicios/ficheros.service';

@Component({
  selector: 'app-pedidos-proveedor',
  templateUrl: './pedidos-proveedor.component.html',
  styleUrls: ['./pedidos-proveedor.component.css']
})
export class PedidosProveedorComponent implements OnInit {

  public pedidos: Pedido [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public dataSource2: any;

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

  constructor(private usuarioservicio: UsuarioService,
              private pedidosservicio: PedidoService,
              private ficheroservicio: FicherosService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder,
              public dialog: MatDialog) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getPedidos();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getPedidos();
      });
  }



  getPedidos(){
    const texto = this.searchForm.get('texto')?.value || '';
    const estado = this.searchForm.get('estado')?.value || '';

    this.pedidosservicio.getPedidosProveedor(texto, this.usuarioservicio.uid, estado).subscribe((res: any) => {
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

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrar() {
    this.searchForm.controls['texto'].reset();
    this.searchForm.controls['estado'].setValue('');
  }

  imagenUrl(nombre: string){
    return this.ficheroservicio.crearImagenUrl('fotoingrediente', nombre);
  }

  openDetails(id: string){

    this.pedidosservicio.getPedido(id).subscribe((res:any) => {
      const pedido = res['pedidos'];
      let imagenes = [];
      for(let i = 0; i < pedido.ingredientes.length; i++){
        imagenes.push(pedido.ingredientes[i].imagen);
      }
      this.dialog.open(IngredientesProvPedidos, {
        data: {
          pedido,
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
    selector: 'pedidos-prov-ingredientes',
    templateUrl: './pedidos-prov-ingredientes.html',
    styleUrls: ['./pedidos-proveedor.component.css']
  })
  export class IngredientesProvPedidos {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  }
