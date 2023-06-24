import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-verify-link-recovery',
  templateUrl: './verify-link-recovery.component.html',
  styleUrls: ['./verify-link-recovery.component.css']
})
export class VerifyLinkRecoveryComponent implements OnInit {

  public uid: string = '';
  public code: string = '';
  public waiting: boolean = false;
  public formSubmint: boolean = false;
  public equalPWD = false;
  public passwordForm = this.formbuilder.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    repeatPwd: ['', [Validators.required, Validators.minLength(8)]],
  });
  constructor(private formbuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private usuarioServcio: UsuarioService) { }

  ngOnInit(): void {
    this.getVerifyLink();
  }

  getVerifyLink(){
    this.uid = this.route.snapshot.queryParams['id'];
    this.code = this.route.snapshot.params['code'];
    this.usuarioServcio.getRecoveryLink(this.code, this.uid)
      .subscribe((res: any)=> {
      },(err: any) => {
        this.router.navigateByUrl('/login');
        Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No pudo completarse la acción, vuelva a intentarlo más tarde',});
    });
  }

  cambiarPWD(): void{
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

  campoNoValido(campo: string) {
    return this.passwordForm.get(campo)?.invalid && !this.passwordForm.get(campo)?.pristine
  }

}
