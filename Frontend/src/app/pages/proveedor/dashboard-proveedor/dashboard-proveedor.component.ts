import { Component, OnInit } from '@angular/core';
import { IngredienteService } from '../../../servicios/ingrediente.service';
import { UsuarioService } from '../../../servicios/usuario.service';
import { PedidoService } from '../../../servicios/pedido.service';

@Component({
  selector: 'app-dashboard-proveedor',
  templateUrl: './dashboard-proveedor.component.html',
  styleUrls: ['./dashboard-proveedor.component.css']
})
export class DashboardProveedorComponent implements OnInit {

  public total_pedidos = 0;
  public total_pedidos_no_vistos = 0;
  public total_ingredientes = 0;

  constructor(private usuarioservicio: UsuarioService,
              private ingredienteservicio: IngredienteService,
              private pedidoservicio: PedidoService) { }

  ngOnInit(): void {
    this.getIngredientes();
    this.getPedidosTotales();
  }

  getIngredientes(){
    this.ingredienteservicio.getIngredientes('', this.usuarioservicio.uid).subscribe((res: any) => {
      console.log(res);
      this.total_ingredientes = res['total'];
    }, (err) => {
      console.log(err);
    })
  }

  getPedidosTotales(){
    this.pedidoservicio.getPedidosMetricas(this.usuarioservicio.uid).subscribe((res: any) => {
      console.log(res);
      this.total_pedidos = res['total_p'];
      this.total_pedidos_no_vistos = res['total'];
    }, (err) => {
      console.log(err);
    })
  }

}
