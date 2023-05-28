import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../../commons/commons.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { IngredientesCocineroPedidos, PedidosCocineroComponent } from './pedidos-cocinero/pedidos-cocinero.component';
import { CalendarioComponent } from './calendario/calendario.component';
import { ComensalesCocineroComponent } from './comensales-cocinero/comensales-cocinero.component';
import { PedidoCocineroComponent } from './pedido-cocinero/pedido-cocinero.component';
import { RecepcionarPedidoComponent } from './recepcionar-pedido/recepcionar-pedido.component';

@NgModule({
  schemas:[NO_ERRORS_SCHEMA],
  declarations: [
    PedidosCocineroComponent,
    CalendarioComponent,
    ComensalesCocineroComponent,
    IngredientesCocineroPedidos,
    PedidoCocineroComponent,
    RecepcionarPedidoComponent
  ],
  exports: [
    PedidosCocineroComponent,
    CalendarioComponent,
    ComensalesCocineroComponent,
    IngredientesCocineroPedidos
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule
  ]
})
export class CocineroModule { }
