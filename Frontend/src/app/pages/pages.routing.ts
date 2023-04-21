import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { UsuariosLayoutComponent } from '../layouts/usuarios-layout/usuarios-layout.component';

const routes: Routes = [
  { path: 'admin', component: UsuariosLayoutComponent,
    children: [
      { path: '', component: DashboardComponent, data: {
        rol: 'ROL_ADMIN',
        titulo: 'Dashboard Admin'
      } },
      { path: 'dashboard', component: DashboardComponent, data: { rol: 'ROL_ADMIN', titulo: 'dashboard' } },
      { path: 'usuarios', component: DashboardComponent, data: { rol: 'ROL_ADMIN', titulo: 'Usuarios' } },
      { path: 'platos', component: DashboardComponent, data: { rol: 'ROL_ADMIN', titulo: 'Platos' } }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class pagesRoutingModule { }
