import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AutenticationLayoutComponent } from '../layouts/autentication-layout/autentication-layout.component';
import { NoauthGuard } from '../guards/noauth.guard';
import { VerifyLinkConfirmationComponent } from './verify-link-confirmation/verify-link-confirmation.component';

const routes: Routes = [
  { path: 'login', component: AutenticationLayoutComponent, canActivate: [ NoauthGuard],
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  {
    path: 'login/validar/:code', component: AutenticationLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: VerifyLinkConfirmationComponent},
      { path: '**', redirectTo: '' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutenticationRoutingModule { }
