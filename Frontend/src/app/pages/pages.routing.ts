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
import { DashboardSuperComponent } from './supervisor/dashboard-super/dashboard-super.component';
import { UsuariosSuperComponent } from './supervisor/usuarios-super/usuarios-super.component';
import { PedidosSuperComponent } from './supervisor/pedidos-super/pedidos-super.component';
import { MenusSuperComponent } from './supervisor/menus-super/menus-super.component';
import { PlatosSuperComponent } from './supervisor/platos-super/platos-super.component';
import { ComensalesSuperComponent } from './supervisor/comensales-super/comensales-super.component';
import { DashboardProveedorComponent } from './proveedor/dashboard-proveedor/dashboard-proveedor.component';
import { PedidosProveedorComponent } from './proveedor/pedidos-proveedor/pedidos-proveedor.component';
import { IngredientesProveedorComponent } from './proveedor/ingredientes-proveedor/ingredientes-proveedor.component';
import { PedidosCocineroComponent } from './cocinero/pedidos-cocinero/pedidos-cocinero.component';
import { CalendarioComponent } from './cocinero/calendario/calendario.component';
import { ComensalesCocineroComponent } from './cocinero/comensales-cocinero/comensales-cocinero.component';
import { UsuarioComponent } from './admin/usuario/usuario.component';
import { ColegioComponent } from './admin/colegio/colegio.component';
import { ProvinciaComponent } from './admin/provincia/provincia.component';
import { IngredienteProvComponent } from './proveedor/ingrediente-prov/ingrediente-prov.component';
import { ComensalSuperComponent } from './supervisor/comensal-super/comensal-super.component';
import { UsuarioSuperComponent } from './supervisor/usuario-super/usuario-super.component';
import { PedidoCocineroComponent } from './cocinero/pedido-cocinero/pedido-cocinero.component';
import { PlatoSuperComponent } from './supervisor/plato-super/plato-super.component';
import { MenuSuperComponent } from './supervisor/menu-super/menu-super.component';
import { RecepcionarPedidoComponent } from './cocinero/recepcionar-pedido/recepcionar-pedido.component';

const routes: Routes = [
  // path para administradores
  { path: 'admin', component: UsuariosLayoutComponent, data: { rol: 'ROL_ADMIN', titulo: 'Administración' },
    children: [
      { path: '', component: DashboardComponent, canActivate: [AuthGuard], data: {
        rol: 'ROL_ADMIN',
        titulo: 'Administración'
      } },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Administración' } },
      { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Usuarios' } },
        { path: 'usuarios/:id', component: UsuarioComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Usuario' } },
      { path: 'colegios', component: ColegiosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Colegios' } },
        { path: 'colegios/:id', component: ColegioComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Colegio' } },
      { path: 'pedidos', component: PedidosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Pedidos' } },
      { path: 'ingredientes', component: IngredientesComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Ingredientes' } },
      { path: 'menus', component: MenusComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Menus' } },
      { path: 'platos', component: PlatosComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Platos' } },
      { path: 'comensales', component: ComensalesComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Comensales' } },
      { path: 'provincias', component: ProvinciasComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Provincias' } },
        { path: 'provincias/:id', component: ProvinciaComponent, canActivate: [AuthGuard], data: { rol: 'ROL_ADMIN', titulo: 'Provincia' } },
      { path: '**', redirectTo: 'dashboard'}
    ]
  },
  // path para supervisores
  { path: 'super', component: UsuariosLayoutComponent, data: { rol: 'ROL_SUPERVISOR', titulo: 'Administración' },
    children: [
      { path: '', component: DashboardSuperComponent, canActivate: [AuthGuard], data: {
        rol: 'ROL_SUPERVISOR',
        titulo: 'Administración'
      } },
      { path: 'dashboard', component: DashboardSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Administración' } },
      { path: 'usuarios', component: UsuariosSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Usuarios' } },
        { path: 'usuarios/:id', component: UsuarioSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Usuario' } },
      { path: 'pedidos', component: PedidosSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Pedidos' } },
        { path: 'pedidos/:id', component: PedidoCocineroComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Pedido' } },
        { path: 'pedidos/recepcionar/:id', component: RecepcionarPedidoComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Recepcionar pedidos' } },
      { path: 'menus', component: MenusSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Menus' } },
        { path: 'menus/:id', component: MenuSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Menu' } },
      { path: 'platos', component: PlatosSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Platos' } },
        { path: 'platos/:id', component: PlatoSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Plato' } },
      { path: 'comensales', component: ComensalesSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Comensales' } },
        { path: 'comensales/:id', component: ComensalSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_SUPERVISOR', titulo: 'Registro Comensal' } },
      { path: '**', redirectTo: 'dashboard'}
    ]
  },
  // path para proveedores
  { path: 'prov', component: UsuariosLayoutComponent, data: { rol: 'ROL_PROVEEDOR', titulo: 'Administración' },
    children: [
      { path: '', component: DashboardProveedorComponent, canActivate: [AuthGuard], data: {
        rol: 'ROL_SUPERVISOR',
        titulo: 'Administración'
      } },
      { path: 'dashboard', component: DashboardProveedorComponent, canActivate: [AuthGuard], data: { rol: 'ROL_PROVEEDOR', titulo: 'Administración' } },
      { path: 'pedidos', component: PedidosProveedorComponent, canActivate: [AuthGuard], data: { rol: 'ROL_PROVEEDOR', titulo: 'Pedidos' } },
      { path: 'ingredientes', component: IngredientesProveedorComponent, canActivate: [AuthGuard], data: { rol: 'ROL_PROVEEDOR', titulo: 'Ingredientes' } },
        { path: 'ingredientes/:id', component: IngredienteProvComponent, canActivate: [AuthGuard], data: { rol: 'ROL_PROVEEDOR', titulo: 'Ingrediente' } },
      { path: '**', redirectTo: 'dashboard'}
    ]
  },
  // path para cocineros
  { path: 'cocinero', component: UsuariosLayoutComponent, data: { rol: 'ROL_COCINERO', titulo: 'Administración' },
    children: [
      { path: '', component: CalendarioComponent, canActivate: [AuthGuard], data: {
        rol: 'ROL_COCINERO',
        titulo: 'Calendario'
      } },
      { path: 'calendario', component: CalendarioComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Calendario' } },
      // { path: 'dashboard', component: DashboardSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Administración' } },
      { path: 'pedidos', component: PedidosCocineroComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Pedidos' } },
        { path: 'pedidos/:id', component: PedidoCocineroComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Pedido' } },
        { path: 'pedidos/recepcionar/:id', component: RecepcionarPedidoComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Pedidos' } },
      { path: 'comensales', component: ComensalesCocineroComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Comensales' } },
        { path: 'comensales/:id', component: ComensalSuperComponent, canActivate: [AuthGuard], data: { rol: 'ROL_COCINERO', titulo: 'Registro Comensal' } },
      { path: '**', redirectTo: 'dashboard'}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class pagesRoutingModule { }
