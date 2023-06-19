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
import Swal from 'sweetalert2';
import { FicherosService } from 'src/app/servicios/ficheros.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-cocinero',
  templateUrl: './pedidos-cocinero.component.html',
  styleUrls: ['./pedidos-cocinero.component.css']
})
export class PedidosCocineroComponent implements OnInit {

  public pedidos: Pedido [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public dataSource2: any;
  public wait_form = false;

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

  displayedColumns: string[] = ['Nombre', 'Fecha_pedido', 'Fecha_esperada', 'Proveedor', 'Usuario_pedido',
                                'Estado', 'Ingredientes', 'Precio', 'borrar', 'recepcionar'];

  constructor(private usuarioservicio: UsuarioService,
              private pedidosservicio: PedidoService,
              private ficheroservicio: FicherosService,
              private router: Router,
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

  redirigirPedido(uid: string, estado: string){
    if(estado === 'Pendiente'){
      this.router.navigateByUrl(`/cocinero/pedidos/${uid}`);
    } else {
      this.errorPedido();
    }
  }

  errorPedido(){
    Swal.fire({
      title: 'Editar pedido',
      text: 'Solo se pueden editar los pedidos con estado pendiente, si desea añadir más ingredientes a un pedido, por favor cree otro',
      icon: 'error',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Cerrar'
    });
  }

  getPedidos(){
    const texto = this.searchForm.get('texto')?.value || '';
    const estado = this.searchForm.get('estado')?.value || '';
    this.wait_form = true;
    this.pedidosservicio.getPedidos(texto, this.usuarioservicio.colegio, estado).subscribe((res: any) => {
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
      this.wait_form = false;
    });
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }

  borrarPedido(uid: any, name: string) {
    Swal.fire({
      title: 'Eliminar pedido',
      text: `Al eliminar el pedido ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
          if (result.value) {
            this.pedidosservicio.borrarPedido(uid)
              .subscribe( resp => {
                this.getPedidos();
              }
              ,(err) =>{
                Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
              })
          }
      });
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
      this.dialog.open(IngredientesCocineroPedidos, {
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
    selector: 'pedidos-cocinero-ingredientes',
    templateUrl: './pedidos-cocinero-ingredientes.html',
    styleUrls: ['./pedidos-cocinero.component.css']
  })
  export class IngredientesCocineroPedidos {

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  }
