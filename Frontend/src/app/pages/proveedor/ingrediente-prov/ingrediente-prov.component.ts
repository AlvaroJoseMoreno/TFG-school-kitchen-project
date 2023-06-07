import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FicherosService } from 'src/app/servicios/ficheros.service';
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
  public filePicture: string | undefined = '../../../../assets/imagenes/default_ingrediente.png';
  public foto: File | any = null;
  public fileText = 'Seleccione imagen de ingrediente';

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    unidad_medida: ['', Validators.required],
    precio: ['', [Validators.required, Validators.min(0.1)]],
    imagen: ['']
  });

  // formulario para editar objetos

  public datosFormEdit = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    unidad_medida: ['', Validators.required],
    precio: ['', [Validators.required, Validators.min(0.1)]],
    imagen: ['']
  });

  constructor(private fb: FormBuilder,
              private ingredientesServicio: IngredienteService,
              private usuarioservicio: UsuarioService,
              private ficheroservicio: FicherosService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getIngredienteValues();
    } else {
      this.esnuevo = true;
    }
  }

  getIngredienteValues(): void {
    this.wait_form = true;
    this.ingredientesServicio.getIngrediente(this.uid).subscribe((res: any) => {
      const ingrediente = res['ingredientes'];
      this.datosFormEdit.get('uid')?.setValue(this.uid);
      this.datosFormEdit.get('nombre')?.setValue(ingrediente.nombre);
      this.datosFormEdit.get('unidad_medida')?.setValue(ingrediente.unidad_medida);
      this.datosFormEdit.get('precio')?.setValue(ingrediente.precio);
      this.filePicture = this.ficheroservicio.crearImagenUrl('fotoingrediente', ingrediente.imagen);
      this.wait_form = false;
    }, (err) => {
      console.log(err);
    })
  }

  editarIngrediente() {
    console.log(this.datosFormEdit);
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
      let uid = res['ingrediente'].uid;
      this.subirFoto(uid, nombre);
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

  subirFoto(id: string, nombre: string) {
    console.log(this.foto);
    if (this.foto ) {
      this.ficheroservicio.uploadPhotos(this.foto, 'fotoingrediente', id)
      .subscribe( res => {
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
        return;
      }, (err) => {
        console.log(err);
        this.ingredientesServicio.borrarIngrediente(id).subscribe();
        const errtext = err.error.msg || 'No se ha podido crear el ingrediente por fallo de la imagen';
        Swal.fire({icon: 'error', title: 'Oops...', text: errtext});
        return;
      });
    }
  }

  cambioImagen(evento: any): void {
    if (evento.target.files && evento.target.files[0]) {
      console.log(evento.target.files);
      // Comprobamos si es una imagen jpg, jpet, png
      const extensiones = ['jpeg','jpg','png', 'gif'];
      const nombre: string = evento.target.files[0].name;
      const nombrecortado: string[] = nombre.split('.');
      const extension = nombrecortado[nombrecortado.length - 1];
      if(evento.target.files[0].size > 5000000){
        Swal.fire({icon: 'error', title: 'Oops...', text: 'La imagen no debe superar 5 mb'});
        return;
      }
      if (!extensiones.includes(extension.toLowerCase())) {
        // Si no teniamos ningúna foto ya seleccionada antes, dejamos el campo pristine
        if (this.foto === null) {
          this.datosForm.get('imagen')?.markAsPristine();
          console.log(this.datosForm);
        }
        Swal.fire({icon: 'error', title: 'Oops...', text: 'El archivo debe ser una imagen jpeg, jpg o png'});
        return;
      }

      let reader = new FileReader();
      // cargamos el archivo en la variable foto que servirá para enviarla al servidor
      this.foto = evento.target.files[0];
      // leemos el archivo desde el dispositivo
      reader.readAsDataURL(evento?.target?.files[0]);
      // y cargamos el archivo en la imagenUrl que es lo que se inserta en el src de la imagen
      reader.onload = (event) => {
        this.filePicture = event.target?.result?.toString();
        this.fileText = nombre;
      };
    } else {
      console.log('no llega target:', event);
    }
  }

  campoNoValido(campo: string) {
    return (this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine) ||
           (this.datosFormEdit.get(campo)?.invalid && !this.datosFormEdit.get(campo)?.pristine);
  }

  cancelar() {
    this.router.navigateByUrl('/prov/ingredientes');
  }

}
