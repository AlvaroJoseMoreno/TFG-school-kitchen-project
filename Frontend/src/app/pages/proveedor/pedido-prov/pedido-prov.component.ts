import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { Usuario } from 'src/app/modelos/usuario.model';
import { PedidoService } from 'src/app/servicios/pedido.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedido-prov',
  templateUrl: './pedido-prov.component.html',
  styleUrls: ['./pedido-prov.component.css']
})
export class PedidoProvComponent implements OnInit {

  public ingredientes: Ingrediente [] = [];
  public filterProveedor = new FormControl();
  public filterIngredientes = new FormControl();
  public filteredOptions!: Observable<Usuario[]> | null;
  public filteredOptionsIngredientes!: Observable<Ingrediente[]> | null;
  private uid: string = '';
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;
  public select_proveedor = false;
  public total_pedido = 0;
  public ing_pedidos: Ingrediente [] = [];
  public cantidad_ing: number [] = [];
  public cantidad_recepcionada: number [] = [];
  displayedColumns: string[] = ['nombre', 'cantidad', 'cantida_recep', 'total'];
  public dataSource: any;

  public datosFormEdit = this.fb.group({
    uid: [{value: '', disabled: true}],
    nombre: [{value: '', disabled: true}],
    fecha_pedido: [{value: '', disabled: true}],
    fecha_esperada: [{value: '', disabled: true}],
    anotaciones: [{value: '', disabled: true}],
    estado: [{value: '', disabled: true}],
    ingerpedidos: [[]],
    cantidad: [[]]
  });

  constructor(private fb: FormBuilder,
              private pedidoServicio: PedidoService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getValuesPedido();
    } else {
      this.router.navigateByUrl('/prov/pedidos');
    }
  }

  autorizar(){
    Swal.fire({
      title: 'Recepcion de pedido autorizada',
      text: `El pedido ${this.datosFormEdit.get('nombre')?.value} ya puede ser recepcionado`,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    });
  }

  getValuesPedido() {
    this.wait_form = true;
    this.pedidoServicio.getPedido(this.uid).subscribe((res: any) => {
      const pedido = res['pedidos'];
      let date = new Date(pedido.fecha_esperada);
      let currentDate = date.toISOString().substring(0,10);
      let date_pedido = new Date(pedido.fecha_pedido);
      let date_pedido_tostring = date_pedido.toISOString().substring(0,10);
      this.datosFormEdit.get('fecha_esperada')?.setValue(currentDate);
      this.datosFormEdit.get('fecha_pedido')?.setValue(date_pedido_tostring);
      this.datosFormEdit.get('anotaciones')?.setValue(pedido.anotaciones);
      this.datosFormEdit.get('nombre')?.setValue(pedido.nombre);
      this.datosFormEdit.get('estado')?.setValue(pedido.estado);
      this.ing_pedidos = pedido.ingredientes;
      this.dataSource = new MatTableDataSource<Ingrediente>(this.ing_pedidos);
      this.filteredOptionsIngredientes = null;
      this.cantidad_ing = pedido.cantidad;
      this.cantidad_recepcionada = pedido.cantidad_recepcionada;
      this.datosFormEdit.get('ingredientes')?.setValue('');
      this.datosFormEdit.get('ingerpedidos')?.setValue(this.ing_pedidos);
      this.datosFormEdit.get('cantidad')?.setValue(this.cantidad_ing);
      for(let i = 0; i < this.cantidad_ing.length; i++){
        this.total_pedido += this.cantidad_ing[i] * this.ing_pedidos[i].precio;
      }
      this.wait_form = false;
    }, (err) => {
      this.wait_form = false;
      console.log(err);
    })
  }

}
