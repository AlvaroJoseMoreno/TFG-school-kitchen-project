import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public waiting: boolean = false;
  public formSubmint: boolean = false;
  public loginForm = this.formbuilder.group({
    email: ['', [Validators.required, Validators.email] ],
    password: ['', Validators.required ],
    remember: [ false ]
  });

  constructor(private formbuilder: FormBuilder,
              private usuarioservicio: UsuarioService,
              private router: Router) { }

  ngOnInit(): void {

  }

  login(): void {
    let loginFormValue = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value,
      remember: this.loginForm.get('remember')?.value
    }
    this.formSubmint = true;
    if (!this.loginForm.valid) {
      return;
    }
    this.waiting = true;
    this.usuarioservicio.login(loginFormValue).subscribe( res => {
      console.log(res);
        this.waiting = false;
        this.formSubmint = false;
        switch (this.usuarioservicio.rol) {
          case 'ROL_ADMIN':
            this.router.navigateByUrl('/admin/dashboard');
            break;
          case 'ROL_SUPERVISOR':
            this.router.navigateByUrl('/super/dashboard');
            break;
          case 'ROL_COCINERO':
            this.router.navigateByUrl('/cocinero');
            break;
          case 'ROL_PROVEEDOR':
            this.router.navigateByUrl('/prov/dashboard');
            break;
        }
    }, (err) => {
      this.loginForm.reset();
      this.waiting = false;
      this.formSubmint = false;
      const errtext = err.error.msg || 'No se pudo iniciar sesión, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  logout(){
    sessionStorage.clear();
    localStorage.clear();
  }

  campoValidoLogin( campo: string ){
    let campoo = this.loginForm.get(campo);
    if(campoo!=null){
      return campoo.valid || !this.formSubmint;
    }else{
      return true;
    }
  }

}
