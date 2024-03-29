import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
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
import { IngredientesPlatos, PlatosComponent } from './platos/platos.component';
import { MenusComponent } from './menus/menus.component';
import { IngredientesPedidos, PedidosComponent } from './pedidos/pedidos.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule} from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioComponent } from './usuario/usuario.component';
import { ProvinciaComponent } from './provincia/provincia.component';
import { ColegioComponent } from './colegio/colegio.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  schemas:[NO_ERRORS_SCHEMA],
  declarations: [
    DashboardComponent,
    UsuariosComponent,
    ColegiosComponent,
    ProvinciasComponent,
    ComensalesComponent,
    IngredientesComponent,
    PlatosComponent,
    MenusComponent,
    PedidosComponent,
    IngredientesPedidos,
    IngredientesPlatos,
    UsuarioComponent,
    ProvinciaComponent,
    ColegioComponent
  ],
  exports: [
    DashboardComponent,
    UsuariosComponent,
    ColegiosComponent,
    ProvinciasComponent,
    ComensalesComponent,
    IngredientesComponent,
    PlatosComponent,
    MenusComponent,
    PedidosComponent,
    MatListModule,
    MatDividerModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ]
})
export class AdminModule { }
