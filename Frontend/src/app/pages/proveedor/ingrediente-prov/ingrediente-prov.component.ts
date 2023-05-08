import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ingrediente-prov',
  templateUrl: './ingrediente-prov.component.html',
  styleUrls: ['./ingrediente-prov.component.css']
})
export class IngredienteProvComponent implements OnInit {

  private formSubmited = false;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', Validators.required],
    unidad_medida: ['kg', Validators.required],
    precio: [0, Validators.required],
    imagen: ['default_ingrediente.jpg']
  });

  constructor(private fb: FormBuilder,
              private ingredientesServicio: IngredienteService,
              private usuarioservicio: UsuarioService,
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


  crearIngrediente(){
    this.waiting = true;
    const data = {
      uid: 'nuevo',
      nombre: this.datosForm.value.nombre,
      unidad_medida: this.datosForm.value.unidad_medida,
      precio: this.datosForm.value.precio,
      imagen: this.datosForm.value.imagen,
      proveedor: this.usuarioservicio.uid
    }
    this.ingredientesServicio.crearIngrediente(data).subscribe((res: any) => {
      console.log(res);
      this.waiting = false;
      let nombre = res['ingrediente'].nombre;
      Swal.fire({
        title: 'Ingrediente creado',
        text: `El ingrediente ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('prov/ingredientes');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el ingrediente, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  cancelar() {
    this.router.navigateByUrl('/prov/ingredientes');
  }

}
