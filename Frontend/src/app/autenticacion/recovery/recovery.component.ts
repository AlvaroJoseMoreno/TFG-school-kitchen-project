import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html',
  styleUrls: ['./recovery.component.css']
})
export class RecoveryComponent implements OnInit {

  public waiting: boolean = false;
  public formSubmint: boolean = false;
  public recoveryForm = this.formbuider.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private formbuider: FormBuilder,
              private usuarioservicio: UsuarioService) { }

  ngOnInit(): void {
  }

  recovery() {
    this.waiting = true;
    this.usuarioservicio.sendEmailRecovery(this.recoveryForm.value).subscribe((res: any) => {
      this.waiting = false;
      Swal.fire({icon: 'success', title: 'Recuperar contraseña', text: 'Si su usuario está registrado, le llegará un correo para renovar su contraseña'});
    }, (err) => {
      this.waiting = false;
      Swal.fire({icon: 'success', title: 'Recuperar contraseña', text: 'Si su usuario está registrado, le llegará un correo para renovar su contraseña'});
    })
  }

  campoValidoRecovery(campo: string) {
    return this.recoveryForm.get(campo)?.invalid && !this.recoveryForm.pristine;
  }

}
