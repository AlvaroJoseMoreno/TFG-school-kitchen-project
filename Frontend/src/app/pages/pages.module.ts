import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../commons/commons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosLayoutComponent } from '../layouts/usuarios-layout/usuarios-layout.component';
import { AdminModule } from './admin/admin.module';
import { SuperModule } from './supervisor/super.module';
import { ProveedorModule } from './proveedor/prov.module';
import { CocineroModule } from './cocinero/cocinero.module';

@NgModule({
  declarations: [
    UsuariosLayoutComponent,
  ],
  exports: [
    UsuariosLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
    FormsModule,
    ReactiveFormsModule,
    AdminModule,
    SuperModule,
    ProveedorModule,
    CocineroModule
  ],
  entryComponents: []

})
export class PagesModule { }
