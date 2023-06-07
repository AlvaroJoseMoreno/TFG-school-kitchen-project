import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Provincia } from 'src/app/modelos/provincia.model';
import { ColegioService } from 'src/app/servicios/colegio.service';
import { ProvinciaService } from 'src/app/servicios/provincia.service';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-colegio',
  templateUrl: './colegio.component.html',
  styleUrls: ['./colegio.component.css']
})
export class ColegioComponent implements OnInit {

  private formSubmited = false;
  public provincias: Provincia [] = [];
  public filterProvincia = new FormControl();
  public filteredOptions!: Observable<Provincia[]>;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;
  public select_provincia = false;

  // formulario con el que se creará un nuevo colegio
  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(6)]],
    telefono: ['', [Validators.required, Validators.pattern('[6|7]{1}[0-9]{8}')]],
    provincia: ['', Validators.required],
    direccion: ['', [Validators.required, Validators.minLength(20)]]
  });

  // formulario para editar un colegio

  public datosFormEdit = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(6)]],
    telefono: ['', [Validators.required, Validators.pattern('[6|7]{1}[0-9]{8}')]],
    provincia: ['', Validators.required],
    direccion: ['', [Validators.required, Validators.minLength(20)]]
  });

  constructor(private fb: FormBuilder,
              private provinciaService: ProvinciaService,
              private colegioServicio: ColegioService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getColegioValues();
    } else {
      this.esnuevo = true;
    }
    this.getProvincias();
  }

  getColegioValues(): void {
    this.wait_form = true;
    this.colegioServicio.getColegio(this.uid).subscribe((res: any) => {
      const colegio = res['colegios'];
      this.datosFormEdit.get('uid')?.setValue(this.uid);
      this.datosFormEdit.get('nombre')?.setValue(colegio.nombre);
      this.datosFormEdit.get('provincia')?.setValue(colegio.provincia.nombre);
      this.datosFormEdit.get('telefono')?.setValue(colegio.telefono);
      this.datosFormEdit.get('direccion')?.setValue(colegio.direccion);
      this.wait_form = false;
    }, (err) => {
      console.log(err);
    })
  }

  editarColegio(){
    console.log(this.datosFormEdit);
  }

  private filtro(): Provincia[] {
    return this.provincias.filter(option => option.nombre!.toLowerCase().includes(
      this.datosForm?.value?.provincia?.toLowerCase() || this.datosFormEdit?.value?.provincia?.toLowerCase()
      )
    );
  }

  getProvincias() {
    this.provinciaService.getProvincias('').subscribe((res: any) => {
      console.log(res);
      this.provincias = res['provincias'];
      this.filteredOptions = this.filterProvincia.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  crearColegio(){
    if(this.obtainProvinciaId() == ''){
      return;
    }
    this.waiting = true;
    console.log(this.datosForm);
    this.colegioServicio.crearColegio(this.datosForm.value).subscribe((res:any) => {
      this.waiting = false;
      let nombre = res['colegio'].nombre;
      Swal.fire({
        title: 'Colegio creado',
        text: `El colegio ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('admin/colegios');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el colegio, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
    });
  }

  obtainProvinciaId(): string {
    let col = '';
    let exist_provincia = false;
    for(let x = 0; x < this.provincias.length; x++){
      if(this.provincias[x].nombre === this.datosForm.get('provincia')?.value){
        exist_provincia = true;
        this.datosForm.value.provincia = this.provincias[x].uid;
        break;
      }
      if(this.provincias[x].nombre === this.datosFormEdit.get('provincia')?.value){
        exist_provincia = true;
        this.datosForm.value.provincia = this.provincias[x].uid;
        break;
      }
    }
    if((this.datosForm.get('provincia')?.value.length > 0 ||
        this.datosFormEdit.get('provincia')?.value.length > 0)
        && !exist_provincia) { return ''; }

    if(exist_provincia){
      col = this.datosForm.value.provincia || this.datosFormEdit.value.provincia;
    }
    return col;
  }

  campoNoValido( campo: string) {
    return this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine;
  }

  campoNoValidoEdit( campo: string) {
    return this.datosFormEdit.get(campo)?.invalid && !this.datosFormEdit.get(campo)?.pristine;
  }

  selectProvincia(){
    if(this.datosForm.get('provincia')?.value.length > 0 || this.datosFormEdit.get('provincia')?.value.length > 0){
      this.select_provincia =true;
    }
  }

  selectProvinciaTrue(){
    let value_province = this.datosForm.get('provincia')?.value || this.datosFormEdit.get('provincia')?.value || '';
    for(let i = 0; i < this.provincias.length; i++){
      if(this.provincias[i].nombre == value_province){
        this.select_provincia = false;
      }
    }
  }

  selectProvinciaTrueKey(event: any){
    if(event.keyCode == 13 || event.code == 'Enter'){
      this.selectProvinciaTrue();
    }
  }

  cancelar() {
    this.router.navigateByUrl('/admin/colegios');
  }

}
