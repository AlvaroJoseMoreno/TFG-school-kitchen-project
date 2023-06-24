import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AutenticationLayoutComponent } from '../layouts/autentication-layout/autentication-layout.component';
import { NoauthGuard } from '../guards/noauth.guard';
import { VerifyLinkConfirmationComponent } from './verify-link-confirmation/verify-link-confirmation.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { VerifyLinkRecoveryComponent } from './verify-link-recovery/verify-link-recovery.component';

const routes: Routes = [
  { path: 'login', component: AutenticationLayoutComponent, canActivate: [ NoauthGuard],
    children: [
      { path: '', component: LoginComponent }
    ]
  },
  { path: 'recovery', component: AutenticationLayoutComponent, canActivate: [ NoauthGuard],
    children: [
      { path: '', component: RecoveryComponent }
    ]
  },
  {
    path: 'login/validar/:code', component: AutenticationLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: VerifyLinkConfirmationComponent},
      { path: '**', redirectTo: '' }
    ]
  },
  {
    path: 'login/recovery/:code', component: AutenticationLayoutComponent, canActivate: [NoauthGuard],
    children: [
      { path: '', component: VerifyLinkRecoveryComponent},
      { path: '**', redirectTo: '' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AutenticationRoutingModule { }
