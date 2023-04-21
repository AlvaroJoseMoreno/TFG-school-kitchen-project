import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/servicios/usuario.service';

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
    this.usuarioservicio.login(loginFormValue).subscribe( res => {
      console.log(res);
        this.router.navigateByUrl('/admin');
        this.formSubmint = false;
    }, (err) => {
      console.log(err);
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
