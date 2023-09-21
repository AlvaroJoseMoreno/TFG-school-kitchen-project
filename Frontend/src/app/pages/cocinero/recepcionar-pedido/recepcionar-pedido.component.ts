import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { Pedido } from 'src/app/modelos/pedido.model';
import { PedidoService } from 'src/app/servicios/pedido.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recepcionar-pedido',
  templateUrl: './recepcionar-pedido.component.html',
  styleUrls: ['./recepcionar-pedido.component.css']
})
export class RecepcionarPedidoComponent implements OnInit {

  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public pedido: Pedido | null = null;
  public estado: String | undefined = '';
  public proveedor: string | undefined = '';
  public tipo_proveedor: string | undefined = '';
  public nombre_pedido = '';
  public cantidad_pedida: number [] = [];
  public cantidad_recepcionada: number [] = [];
  public cantidad_enviar: number [] = [];
  public formValid: boolean = false;
  displayedColumns: string[] = ['nombre', 'cantidad_total', 'cantidad_recepcionada', 'cantidad_enviar'];
  public dataSource: any;

  public datosForm = this.fb.group({
    uid: ['', Validators.required],
    cantidad: [[], Validators.required]
  });

  constructor(private usuarioservicio: UsuarioService,
              private fb: FormBuilder,
              private pedidoservicio: PedidoService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    this.getPedido();
  }

  getPedido(){
    this.pedidoservicio.getPedido(this.uid).subscribe((res: any) => {
      this.pedido = res['pedidos'];
      this.cantidad_pedida = res['pedidos'].cantidad;
      this.cantidad_recepcionada = res['pedidos'].cantidad_recepcionada;
      this.nombre_pedido = res['pedidos'].nombre;
      this.estado = this.pedido?.estado;
      this.tipo_proveedor = this.setTypeProveedor(this.pedido?.proveedor.tipo_proveedor);
      this.proveedor = this.pedido?.proveedor.nombre;
      for(let i = 0; i < this.cantidad_pedida.length; i++){
        this.cantidad_enviar.push(0);
      }
      this.dataSource = new MatTableDataSource<Ingrediente>(this.pedido?.ingredientes);
      console.log(this.cantidad_enviar);
      console.log(this.cantidad_pedida);
      console.log(this.pedido);
      this.datosForm.get('cantidad')?.setValue(this.cantidad_enviar);
      this.datosForm.get('uid')?.setValue(this.uid);
    }, (err) => {
      console.log(err);
      this.usuarioservicio.rol == 'ROL_COCINERO' ?
      this.router.navigateByUrl('cocinero/pedidos') :
      this.router.navigateByUrl('super/pedidos') ;
    });
  }

  enviarRecepcion(){
    console.log(this.datosForm.get('cantidad'));
    const data = {
      id: this.uid,
      cantidad_recepcionada: this.cantidad_enviar
    }
    this.waiting = true;
    this.pedidoservicio.recepcionarPedido(data, this.uid).subscribe((res: any) => {
      console.log(res);
      let msg = '';
      msg = (res['pedido'].estado == 'Entregado')  ?
      'El pedido se ha completado totalmente con éxito y se han recibido todos los ingredientes' :
      'Los ingredientes han sido recibidos con éxito, pero aún faltan ingredientes por recibir';
      Swal.fire({
        title: 'Pedido recepcionado con éxito',
        text: msg,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.usuarioservicio.rol == 'ROL_COCINERO' ?
          this.router.navigateByUrl('cocinero/pedidos') :
          this.router.navigateByUrl('super/pedidos') ;
        }
      });
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo recepcionar el pedido, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  setInputCantidad(event: any, index: number){
    console.log(event);
    let v = document.getElementById(event) as HTMLInputElement;
    this.cantidad_enviar[index] = Number(v.value);
    if(Number(v.value) + this.cantidad_recepcionada[index] > this.cantidad_pedida[index]){
      this.formValid = false;
      console.log('Entro');
      return;
    }
    this.formValid = true;
    this.datosForm.get('cantidad')?.setValue(this.cantidad_enviar);
    console.log(this.datosForm);
  }

  setTypeProveedor(tipo: any): string{
    let tipo_proveedor = '';
    switch (tipo) {
      case 'CARNE':
        tipo_proveedor = 'carne'
        break;
      case 'PESCADO':
        tipo_proveedor = 'pescado'
        break;
      case 'FRUTAVERDURA':
        tipo_proveedor = 'fruta y verdura'
        break;
      case 'LACTEOS':
        tipo_proveedor = 'lacteos'
        break;
      case 'ESPECIAS':
        tipo_proveedor = 'especias'
        break;
      case 'DULCES':
        tipo_proveedor = 'dulces'
        break;
      default:
        break;
    }
    return tipo_proveedor;
  }

  cancelar() {
    this.usuarioservicio.rol == 'ROL_COCINERO' ?
    this.router.navigateByUrl('cocinero/pedidos') :
    this.router.navigateByUrl('super/pedidos') ;
  }

}
