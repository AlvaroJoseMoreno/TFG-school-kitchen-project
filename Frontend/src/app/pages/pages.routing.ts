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
import { MenusComponent } from './admin/menus/menus.component';
import { PedidosComponent } from './admin/pedidos/pedidos.component';
import { AuthGuard } from '../guards/auth.guard';

const routes: Routes = [
  { path: 'admin', component: UsuariosLayoutComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Administración' },
    children: [
      { path: '', component: DashboardComponent, canActivate: [AuthGuard], data: {
        rol: 'ROL_ADMIN',
        titulo: 'Administración'
      } },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Administración' } },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Usuarios' } },
      { path: 'colegios', component: ColegiosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Colegios' } },
      { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Pedidos' } },
      { path: 'ingredientes', component: IngredientesComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Ingredientes' } },
      { path: 'menus', component: MenusComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Menus' } },
      { path: 'platos', component: PlatosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Platos' } },
      { path: 'comensales', component: ComensalesComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Comensales' } },
      { path: 'provincias', component: ProvinciasComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Provincias' } },
      { path: '**', redirectTo: 'dashboard'}
    ]
  },
  { path: 'super', component: UsuariosLayoutComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Administración' },
    children: [
      { path: '', component: DashboardComponent, canActivate: [AuthGuard], data: {
        rol: 'ROL_SUPERVISOR',
        titulo: 'Administración'
      } },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Administración' } },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Usuarios' } },
      { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Pedidos' } },
      { path: 'menus', component: MenusComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Menus' } },
      { path: 'platos', component: PlatosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Platos' } },
      { path: 'comensales', component: ComensalesComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Comensales' } },
      { path: '**', redirectTo: 'dashboard'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class pagesRoutingModule { }
