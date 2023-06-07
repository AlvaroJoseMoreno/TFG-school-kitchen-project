import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ComensalService } from 'src/app/servicios/comensal.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comensal-super',
  templateUrl: './comensal-super.component.html',
  styleUrls: ['./comensal-super.component.css']
})
export class ComensalSuperComponent implements OnInit {

  private formSubmited = false;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    fecha: ['', Validators.required],
    num_comensales: ['', [Validators.required, Validators.min(1), Validators.maxLength(3)]]
  });
  // formulario de editar
  public datosFormEdit = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    fecha: ['', Validators.required],
    num_comensales: ['', [Validators.required, Validators.min(1), Validators.maxLength(3)]]
  });

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private comensalServicio: ComensalService,
              private usuarioServicio: UsuarioService,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getComensalValues();
    } else {
      this.esnuevo = true;
    }
  }

  getComensalValues() {
    this.wait_form = true;
    this.comensalServicio.getComensal(this.uid).subscribe((res: any) => {
      const comensal = res['comensales'];
      var date = new Date(comensal.fecha);
      var currentDate = date.toISOString().substring(0,10);
      this.datosFormEdit.get('uid')?.setValue(this.uid);
      this.datosFormEdit.get('fecha')?.setValue(currentDate);
      this.datosFormEdit.get('num_comensales')?.setValue(comensal.num_comensales);
      this.wait_form = false;
    }, (err) => {
      this.wait_form = false;
      console.log(err);
    });
  }

  editarComensal() {
    console.log(this.datosFormEdit);
  }

  cancelar() {
    return this.usuarioServicio.rol == 'ROL_SUPERVISOR' ?
    this.router.navigateByUrl('/super/comensales') : this.router.navigateByUrl('/cocinero/comensales');
  }

  campoNoValido(campo: string) {
    return (this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine) ||
           (this.datosFormEdit.get(campo)?.invalid && !this.datosFormEdit.get(campo)?.pristine);
  }

  crearComensal(){
    this.waiting = true;
    const data = {
      fecha: this.datosForm.value.fecha,
      num_comensales: this.datosForm.value.num_comensales,
      colegio: this.usuarioServicio.colegio,
      usuario: this.usuarioServicio.uid
    }

    this.comensalServicio.crearComensales(data).subscribe((res: any) => {
      this.waiting = false;
      console.log(res);
      Swal.fire({
        title: 'Registro de comensales creado',
        text: `El registro de comensales ha sido creada con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.usuarioServicio.rol == 'ROL_SUPERVISOR' ?
          this.router.navigateByUrl('/super/comensales') :
          this.router.navigateByUrl('/cocinero/comensales');
        }
      });
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el registro de comensales, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    })
  }

}
