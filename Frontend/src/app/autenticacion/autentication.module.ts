import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RecoveryComponent } from './recovery/recovery.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; //Formulario reactivo
import { HttpClientModule } from '@angular/common/http';
import { CommonsModule } from '../commons/commons.module';
import { AutenticationLayoutComponent } from '../layouts/autentication-layout/autentication-layout.component';
import { VerifyLinkConfirmationComponent } from './verify-link-confirmation/verify-link-confirmation.component';
import { VerifyLinkRecoveryComponent } from './verify-link-recovery/verify-link-recovery.component';


@NgModule({
  declarations: [
    LoginComponent,
    RecoveryComponent,
    AutenticationLayoutComponent,
    VerifyLinkConfirmationComponent,
    VerifyLinkRecoveryComponent
  ],
  exports:[
    LoginComponent,
    RecoveryComponent,
    AutenticationLayoutComponent
  ],
  imports: [
    CommonModule,
    CommonsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AutenticacionModule { }
