import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Colegio } from 'src/app/modelos/colegio.model';
import { ColegioService } from 'src/app/servicios/colegio.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css']
})
export class UsuarioComponent implements OnInit {

  private formSubmited = false;
  public colegios: Colegio [] = [];
  public filterColegio = new FormControl();
  public filteredOptions!: Observable<Colegio[]>;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;
  public select_colegio = false;

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    email: [ '', [Validators.required, Validators.email]],
    nombre: ['', [Validators.required, Validators.minLength(8)]],
    telefono: ['', Validators.pattern('[6|7]{1}[0-9]{8}')],
    colegio: [''],
    rol: ['', Validators.required],
    ciudad: ['', [Validators.required, Validators.minLength(3)]]
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private colegioServicio: ColegioService,
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
    this.getColegios();
    console.log(this.uid);
  }

  private filtro(): Colegio[] {
    return this.colegios.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.colegio.toLowerCase()));
  }

  getColegios() {
    this.colegioServicio.getColegios('', '').subscribe((res: any) => {
      console.log(res);
      this.colegios = res['colegios'];
      this.filteredOptions = this.filterColegio.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  crearUsuario(){
    const rol_selected = this.datosForm.get('rol')?.value;
    return rol_selected == 'ROL_ADMIN' ? this.crearAdmin() : rol_selected == 'ROL_SUPERVISOR' ? this.crearSuper() : '';
  }

  crearAdmin(){
    this.waiting = true;
    this.datosForm.value.colegio = undefined;
    this.usuarioService.nuevoAdmin(this.datosForm.value).subscribe((res: any) => {
      this.waiting = false;
      let nombre = res['usuario'].nombre;
      Swal.fire({
        title: 'Administrador creado',
        text: `El administrador ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('admin/usuarios');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el administrador, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  crearSuper(){
    if(this.obtainColegioId() == ''){
      return;
    }
    this.waiting = true;
    this.usuarioService.nuevoSupervisor(this.datosForm.value).subscribe((res:any) => {
      this.waiting = false;
      let nombre = res['usuario'].nombre;
      Swal.fire({
        title: 'Supervisor creado',
        text: `El supervisor ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('admin/usuarios');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el administrador, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
    });
  }

  obtainColegioId(): string {
    let col = '';
    let exist_colegio = false;
    for(let x = 0; x < this.colegios.length; x++){
      if(this.colegios[x].nombre === this.datosForm.get('colegio')?.value){
        exist_colegio = true;
        this.datosForm.value.colegio = this.colegios[x].uid;
        break;
      }
    }
    if(this.datosForm.get('colegio')?.value.length > 0 && !exist_colegio) { return ''; }

    if(exist_colegio){
      col = this.datosForm.value.colegio;
    }
    return col;
  }

  campoNoValido(campo: string) {
    return this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine;
  }

  selectColegio(){
    if(this.datosForm.get('colegio')?.value.length > 0){
      this.select_colegio =true;
    }
  }

  selectColegioTrue(){
    let value_province = this.datosForm.get('colegio')?.value || '';
    for(let i = 0; i < this.colegios.length; i++){
      if(this.colegios[i].nombre == value_province){
        this.select_colegio = false;
      }
    }
  }

  selectColegioTrueKey(event: any){
    if(event.keyCode == 13 || event.code == 'Enter'){
      this.selectColegioTrue();
    }
  }

  cancelar() {
    this.router.navigateByUrl('/admin/usuarios');
  }

}
