import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-link-confirmation',
  templateUrl: './verify-link-confirmation.component.html',
  styleUrls: ['./verify-link-confirmation.component.css']
})
export class VerifyLinkConfirmationComponent implements OnInit {

  public uid: string = '';
  public code: string = '';
  public waiting: boolean = false;
  public formSubmint: boolean = false;
  public equalPWD = false;
  public passwordForm = this.formbuilder.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    repeatPwd: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(private router: Router,
              private formbuilder: FormBuilder,
              private usuarioServcio: UsuarioService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getVerifyLink();
  }

  getVerifyLink(){
    console.log(this.route);
    this.uid = this.route.snapshot.queryParams['id'];
    this.code = this.route.snapshot.params['code'];
    this.usuarioServcio.getVerifyLink(this.code, this.uid)
      .subscribe((res: any)=> {
        console.log(res);
      },(err: any) => {
        console.log(err);
        this.router.navigateByUrl('/login');
        Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
    });
  }

  cambiarPWD(): void{
    console.log('Cambiamos pwd');
    console.log('Code: ', this.code, ' uid: ', this.uid);
    this.usuarioServcio.cambiarPWD(this.code, this.uid, this.passwordForm.value).subscribe(res => {
      Swal.fire({
        title: 'Contraseña creada',
        text: `La contraseña se ha modificado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('');
        }
      });
    }, (err) => {
      Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
      console.log(err);
    })
  }

  comprobarPWD(): void{
    if(this.passwordForm.get('password')?.value == this.passwordForm.get('repeatPwd')?.value){
      this.equalPWD = true
    } else {
      this.equalPWD = false;
    }
  }
}
