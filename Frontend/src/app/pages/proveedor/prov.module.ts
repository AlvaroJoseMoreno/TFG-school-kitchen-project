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
import { DashboardProveedorComponent } from './dashboard-proveedor/dashboard-proveedor.component';
import { IngredientesProvPedidos, PedidosProveedorComponent } from './pedidos-proveedor/pedidos-proveedor.component';
import { IngredientesProveedorComponent } from './ingredientes-proveedor/ingredientes-proveedor.component';
import { IngredienteProvComponent } from './ingrediente-prov/ingrediente-prov.component';
import { PedidoProvComponent } from './pedido-prov/pedido-prov.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  schemas:[NO_ERRORS_SCHEMA],
  declarations: [
    DashboardProveedorComponent,
    PedidosProveedorComponent,
    IngredientesProveedorComponent,
    IngredienteProvComponent,
    IngredientesProvPedidos,
    PedidoProvComponent
  ],
  exports: [
    DashboardProveedorComponent,
    PedidosProveedorComponent,
    IngredientesProveedorComponent
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
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class ProveedorModule { }
