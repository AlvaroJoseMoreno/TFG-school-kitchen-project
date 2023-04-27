import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AutenticationLayoutComponent } from '../layouts/autentication-layout/autentication-layout.component';
import { NoauthGuard } from '../guards/noauth.guard';

const routes: Routes = [
  { path: 'login', component: AutenticationLayoutComponent, canActivate: [ NoauthGuard],
    children: [
      { path: '', component: LoginComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutenticationRoutingModule { }
