import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../../commons/commons.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ColegiosComponent } from './colegios/colegios.component';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ProvinciasComponent } from './provincias/provincias.component';
import { ComensalesComponent } from './comensales/comensales.component';
import { IngredientesComponent } from './ingredientes/ingredientes.component';
import { PlatosComponent } from './platos/platos.component';

@NgModule({
  declarations: [
    DashboardComponent,
    UsuariosComponent,
    ColegiosComponent,
    ProvinciasComponent,
    ComensalesComponent,
    IngredientesComponent,
    PlatosComponent,
  ],
  exports: [
    DashboardComponent,
    UsuariosComponent
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
    MatAutocompleteModule
  ]
})
export class AdminModule { }
