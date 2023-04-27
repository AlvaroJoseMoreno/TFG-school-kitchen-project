import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AutenticationRoutingModule } from './autenticacion/autentication.routing';
import { pagesRoutingModule } from './pages/pages.routing';

const routes: Routes = [
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    AutenticationRoutingModule,
    pagesRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
