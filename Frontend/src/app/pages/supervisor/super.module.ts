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
import { DashboardSuperComponent } from './dashboard-super/dashboard-super.component';
import { UsuariosSuperComponent } from './usuarios-super/usuarios-super.component';
import { ComensalesSuperComponent } from './comensales-super/comensales-super.component';
import { IngredientesSuperPlatos, PlatosSuperComponent } from './platos-super/platos-super.component';
import { MenusSuperComponent } from './menus-super/menus-super.component';
import { IngredientesSuperPedidos, PedidosSuperComponent } from './pedidos-super/pedidos-super.component';

@NgModule({
  schemas:[NO_ERRORS_SCHEMA],
  declarations: [
    DashboardSuperComponent,
    UsuariosSuperComponent,
    ComensalesSuperComponent,
    PlatosSuperComponent,
    MenusSuperComponent,
    PedidosSuperComponent,
    IngredientesSuperPlatos,
    IngredientesSuperPedidos
  ],
  exports: [
    DashboardSuperComponent,
    UsuariosSuperComponent,
    ComensalesSuperComponent,
    PlatosSuperComponent,
    MenusSuperComponent,
    PedidosSuperComponent
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
export class SuperModule { }