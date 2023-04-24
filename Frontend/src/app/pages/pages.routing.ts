import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { UsuariosLayoutComponent } from '../layouts/usuarios-layout/usuarios-layout.component';
import { UsuariosComponent } from './admin/usuarios/usuarios.component';
import { ColegiosComponent } from './admin/colegios/colegios.component';
import { ProvinciasComponent } from './admin/provincias/provincias.component';
import { ComensalesComponent } from './admin/comensales/comensales.component';
import { IngredientesComponent } from './admin/ingredientes/ingredientes.component';
import { PlatosComponent } from './admin/platos/platos.component';

const routes: Routes = [
  { path: 'admin', component: UsuariosLayoutComponent,
    children: [
      { path: '', component: DashboardComponent, data: {
        rol: 'ROL_ADMIN',
        titulo: 'Administración'
      } },
      { path: 'dashboard', component: DashboardComponent, data: { rol: 'ROL_ADMIN', titulo: 'Administración' } },
      { path: 'usuarios', component: UsuariosComponent, data: { rol: 'ROL_ADMIN', titulo: 'Usuarios' } },
      { path: 'colegios', component: ColegiosComponent, data: { rol: 'ROL_ADMIN', titulo: 'Colegios' } },
      { path: 'pedidos', component: DashboardComponent, data: { rol: 'ROL_ADMIN', titulo: 'Pedidos' } },
      { path: 'ingredientes', component: IngredientesComponent, data: { rol: 'ROL_ADMIN', titulo: 'Ingredientes' } },
      { path: 'menus', component: DashboardComponent, data: { rol: 'ROL_ADMIN', titulo: 'Menus' } },
      { path: 'platos', component: PlatosComponent, data: { rol: 'ROL_ADMIN', titulo: 'Platos' } },
      { path: 'comensales', component: ComensalesComponent, data: { rol: 'ROL_ADMIN', titulo: 'Comensales' } },
      { path: 'provincias', component: ProvinciasComponent, data: { rol: 'ROL_ADMIN', titulo: 'Provincias' } },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class pagesRoutingModule { }
