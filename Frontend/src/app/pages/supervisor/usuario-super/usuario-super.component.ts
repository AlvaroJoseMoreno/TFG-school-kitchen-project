import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario-super',
  templateUrl: './usuario-super.component.html',
  styleUrls: ['./usuario-super.component.css']
})
export class UsuarioSuperComponent implements OnInit {

  private formSubmited = false;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    email: [ '', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', Validators.pattern('[6|7]{1}[0-9]{8}')],
    tipo_proveedor: [''],
    rol: ['', Validators.required],
    colegio: [''],
    ciudad: ['', [Validators.required, Validators.minLength(2)]]
  });

  public datosFormEdit = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    email: [ '', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', Validators.pattern('[6|7]{1}[0-9]{8}')],
    tipo_proveedor: [''],
    rol: ['', Validators.required],
    colegio: [''],
    ciudad: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getUserValues();
    } else {
      this.esnuevo = true;
    }
  }

  getUserValues(){
    this.wait_form = true;
    this.usuarioService.getUsuario(this.uid).subscribe((res: any) => {
      const usuario = res['usuarios'];
      this.datosForm.get('uid')?.setValue(this.uid);
      this.datosFormEdit.get('nombre')?.setValue(usuario.nombre);
      this.datosFormEdit.get('email')?.setValue(usuario.email);
      this.datosFormEdit.get('rol')?.setValue(usuario.rol);
      this.datosFormEdit.get('telefono')?.setValue(usuario.telefono);
      if(usuario.tipo_proveedor) this.datosFormEdit.get('tipo_proveedor')?.setValue(usuario.tipo_proveedor);
      this.datosFormEdit.get('ciudad')?.setValue(usuario.ciudad);
      this.wait_form = false;
      console.log(this.datosFormEdit);
      this.wait_form = false;
    }, (err) => {
      this.wait_form = false;
      console.log(err);
    })
  }

  editarUsuario() {
    console.log(this.datosFormEdit);
  }

  crearUsuario(){
    const rol_selected = this.datosForm.get('rol')?.value;
    return rol_selected == 'ROL_COCINERO' ? this.crearCocinero() : rol_selected == 'ROL_PROVEEDOR' ? this.crearProveedor() : '';
  }

  crearCocinero(){
    this.waiting = true;
    this.datosForm.value.colegio = this.usuarioService.colegio;
    this.usuarioService.nuevoCocinero(this.datosForm.value).subscribe((res: any) => {
      this.waiting = false;
      let nombre = res['usuario'].nombre;
      console.log(res);
      Swal.fire({
        title: 'Cocinero creado',
        text: `El cocinero ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('cocinero/usuarios');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el cocinero, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  crearProveedor(){
    this.datosForm.value.colegio = this.usuarioService.colegio;
    if(this.typeProveedor(this.datosForm.value.tipo_proveedor) === ''){
      return;
    }

    this.waiting = true;

    this.usuarioService.nuevoProveedor(this.datosForm.value).subscribe((res:any) => {
      this.waiting = false;
      let nombre = res['usuario'].nombre;
      console.log(res);
      Swal.fire({
        title: 'Proveedor creado',
        text: `El proveedor ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('super/usuarios');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el proveedor, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
    });
  }

  typeProveedor(formValue: string): string {
    const tipos_proveedores = ['CARNE', 'PESCADO', 'FRUTAVERDURA', 'LACTEOS', 'ESPECIAS', 'DULCES'];
    if(tipos_proveedores.includes(formValue)) return formValue;
    return '';
  }

  campoNoValido(campo: string) {
    return (this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine) ||
           (this.datosFormEdit.get(campo)?.invalid && !this.datosFormEdit.get(campo)?.pristine)
  }

  campoNoValidoTipoProveedor() {
    const tipos_proveedores = ['CARNE', 'PESCADO', 'FRUTAVERDURA', 'LACTEOS', 'ESPECIAS', 'DULCES'];
    return !tipos_proveedores.includes(this.datosForm.get('tipo_proveedor')?.value || this.datosFormEdit.get('tipo_proveedor')?.value)
           && (!this.datosForm.get('tipo_proveedor')?.pristine || !this.datosFormEdit.get('tipo_proveedor')?.pristine);
  }

  cancelar() {
    this.router.navigateByUrl('/super/usuarios');
  }

}
