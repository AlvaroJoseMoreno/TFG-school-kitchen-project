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
    nombre: ['', Validators.required],
    telefono: ['', Validators.pattern('[6|7]{1}[0-9]{8}')],
    tipo_proveedor: [''],
    rol: [''],
    colegio: [''],
    ciudad: ['', Validators.required]
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.datosForm.get('uid')?.setValue(this.uid);
      this.wait_form = true;
    } else {
      this.esnuevo = true;
    }
    console.log(this.uid);
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

  cancelar() {
    this.router.navigateByUrl('/super/usuarios');
  }

}
