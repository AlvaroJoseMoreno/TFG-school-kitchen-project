import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProvinciaService } from 'src/app/servicios/provincia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-provincia',
  templateUrl: './provincia.component.html',
  styleUrls: ['./provincia.component.css']
})
export class ProvinciaComponent implements OnInit {

  private formSubmited = false;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(4)]],
    codigo: ['', Validators.required]
  });

  public datosFormEdit = this.fb.group({
    uid: [{value: '', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(4)]],
    codigo: ['', Validators.required],
    colegios: [{value: 0, disabled: true}]
  });

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private provinciaServicio: ProvinciaService,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getProvinciaValue();
    } else {
      this.esnuevo = true;
    }
  }

  getProvinciaValue() {
    this.wait_form = true;
    this.provinciaServicio.getProvincia(this.uid).subscribe((res: any) => {
      this.datosFormEdit.get('uid')?.setValue(this.uid);
      this.datosFormEdit.get('nombre')?.setValue(res['provincias'].nombre);
      this.datosFormEdit.get('codigo')?.setValue(res['provincias'].codigo);
      this.datosFormEdit.get('colegios')?.setValue(res['provincias'].num_colegios);
      this.wait_form = false;
    }, (err) => {
      console.log(err);
    });
  }

  editarProvincia(){
    console.log(this.datosFormEdit);
    Swal.fire({
      title: 'Provincia editada',
      text: `La provincia Álava ha sido editada con éxito`,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.value) {
        this.router.navigateByUrl('admin/provincias');
      }
    });
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine;
  }

  campoNoValidoEdit( campo: string) {
    return this.datosFormEdit.get(campo)?.invalid && !this.datosFormEdit.get(campo)?.pristine;
  }

  cancelar() {
    this.router.navigateByUrl('/admin/provincias');
  }

  crearProvincia(){
    this.waiting = true;
    this.provinciaServicio.crearProvincia(this.datosForm.value).subscribe((res: any) => {
      this.waiting = false;
      console.log(res);
      let nombre = res['provincia'].nombre;
      Swal.fire({
        title: 'Provincia creada',
        text: `La provincia ${nombre} ha sido creada con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('admin/provincias');
        }
      });
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear la provincia, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    })
  }

}
