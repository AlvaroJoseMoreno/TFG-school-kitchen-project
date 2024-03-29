import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { Plato } from 'src/app/modelos/plato.model';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';
import { PlatoService } from 'src/app/servicios/plato.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import Swal from 'sweetalert2';
import { map, startWith } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { Usuario } from 'src/app/modelos/usuario.model';

@Component({
  selector: 'app-plato-super',
  templateUrl: './plato-super.component.html',
  styleUrls: ['./plato-super.component.css']
})
export class PlatoSuperComponent implements OnInit {

  private formSubmited = false;
  public proveedores: Usuario [] = [];
  public ingredientes: Ingrediente [] = [];
  public filterProveedor = new FormControl();
  public filterIngredientes = new FormControl();
  public filteredOptions!: Observable<Usuario[]> | null;
  public filteredOptionsIngredientes!: Observable<Ingrediente[]> | null;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public total_plato = 0;
  public ing_platos: Ingrediente [] = [];
  public cantidad_ing: number [] = [];
  displayedColumns: string[] = ['nombre', 'unidad_medida', 'cantidad', 'borrar'];
  public dataSource: any;
  public lista_alergenos = ['gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes', 'soja', 'lacteos',
                            'frutos', 'apio', 'mostaza', 'sesamo', 'sulfitos', 'altramuces', 'moluscos'];

  dropdownSettings = {
    singleSelection: false,
    selectAllText: 'Selecciona todos',
    unSelectAllText: 'Deselecciona todos',
    allowSearchFilter: true
  }

  // formulario con el que se creará un nuevo usuario
  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(4)]],
    categoria: ['', Validators.required],
    receta: [''],
    ingredientes: [''],
    ingerplatos: [[], Validators.required],
    cantidad_ingredientes: [[], Validators.required],
    alergenos: [[]],
    colegio: ['']
  });

  public datosFormEdit = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', [Validators.required, Validators.minLength(4)]],
    categoria: ['', Validators.required],
    receta: [''],
    ingredientes: [''],
    ingerplatos: [[], Validators.required],
    cantidad_ingredientes: [[], Validators.required],
    alergenos: [[]],
    colegio: ['']
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private ingredienteServicio: IngredienteService,
              private platoservicio: PlatoService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.uid = this.route.snapshot.params['id'];
    if(this.uid !== 'nuevo'){
      this.getValuesPlato();
    } else {
      this.esnuevo = true;
    }
    this.getIngredientes();
  }

  getValuesPlato() {
    this.wait_form = true;
    this.platoservicio.getPlato(this.uid).subscribe((res: any) => {
      const plato = res['platos'];
      this.datosFormEdit.get('uid')?.setValue(this.uid);
      this.datosFormEdit.get('nombre')?.setValue(plato.nombre);
      this.datosFormEdit.get('receta')?.setValue(plato?.receta);
      this.datosFormEdit.get('categoria')?.setValue(plato.categoria);
      this.datosFormEdit.get('alergenos')?.setValue(plato?.alergenos);
      this.ing_platos = plato.ingredientes;
      this.cantidad_ing = plato.cantidad_ingredientes;
      this.dataSource = new MatTableDataSource<Ingrediente>(this.ing_platos);
      this.datosFormEdit.get('ingerplatos')?.setValue(this.ing_platos);
      this.datosFormEdit.get('cantidad_ingredientes')?.setValue(this.cantidad_ing);
      for(let i = 0; i < this.cantidad_ing.length; i++){
        this.total_plato += this.cantidad_ing[i] * this.ing_platos[i].precio;
      }
      console.log(plato);
      this.wait_form = false;
    }, (err) => {
      console.log(err)
    })
  }

  editarPlato() {
    console.log(this.datosFormEdit);
  }

  private filtroIngredientes(): Ingrediente[] {
    return this.ingredientes.filter(option => option.nombre!.toLowerCase().includes(
        (this.datosForm.value.ingredientes.toLowerCase() || this.datosFormEdit.value.ingredientes.toLowerCase())
      )
    );
  }

  getIngredientes() {
    this.ingredienteServicio.getIngredientes('', '').subscribe((res: any) => {
      this.ingredientes = [];
      let auxIngColegio = res['ingredientes'];
      for(let i = 0; i < auxIngColegio.length; i++){
        if(this.usuarioService.colegio == auxIngColegio[i].proveedor.colegio){
          this.ingredientes.push(auxIngColegio[i]);
        }
      }
      this.filteredOptionsIngredientes = this.filterIngredientes.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroIngredientes()),
      );
    });
  }

  getIngetot(){
    this.filteredOptionsIngredientes = this.filterIngredientes.valueChanges.pipe(
      startWith(''),
      map(value => this.filtroIngredientes()),
    );
  }

  getInputCantidad(event: any, index: number){
    this.total_plato = 0;
    let v = document.getElementById(event) as HTMLInputElement;
    this.cantidad_ing[index] = Number(v.value);
    for(let i = 0; i < this.cantidad_ing.length; i++){
      this.total_plato += this.cantidad_ing[i] * this.ing_platos[i].precio;
    }
    this.total_plato.toFixed(2);
    this.datosForm.get('cantidad_ingredientes')?.setValue(this.cantidad_ing) || this.datosFormEdit.get('cantidad_ingredientes')?.setValue(this.cantidad_ing);
  }

  selecIngredienteTrueKey(event: any){
    let value_ing = this.datosForm.get('ingredientes')?.value || this.datosFormEdit.get('ingredientes')?.value || '';
    for(let i = 0; i < this.ingredientes.length; i++){
      if(this.ingredientes[i].nombre == value_ing){
        this.ing_platos.push(this.ingredientes[i]);
        this.cantidad_ing.push(0);
        this.ingredientes.splice(i, 1);
        this.dataSource = new MatTableDataSource<Ingrediente>(this.ing_platos);
        this.datosForm.get('ingredientes')?.setValue('') || this.datosFormEdit.get('ingredientes')?.setValue('');;
        this.filteredOptionsIngredientes = null;
        this.datosForm.get('ingerplatos')?.setValue(this.ing_platos) || this.datosFormEdit.get('ingerplatos')?.setValue(this.ing_platos);
      }
    }
  }

  borrarIngrediente(i: number){
    this.ingredientes.push(this.ing_platos[i]);
    this.ing_platos.splice(i, 1);
    this.cantidad_ing.splice(i, 1);
    this.dataSource = new MatTableDataSource<Ingrediente>(this.ing_platos);
    this.datosForm.get('ingerplatos')?.setValue(this.ing_platos) || this.datosFormEdit.get('ingerplatos')?.setValue(this.ing_platos);
    this.datosForm.get('cantidad_ingredientes')?.setValue(this.cantidad_ing) || this.datosFormEdit.get('ingerplatos')?.setValue(this.ing_platos);
    this.total_plato = 0;
    for(let x = 0; x < this.cantidad_ing.length; x++){
      this.total_plato += this.cantidad_ing[x] * this.ing_platos[x].precio;
    }
  }

  crearPlato(){
    this.waiting = true;
    let arrIng = [];
    for(let i = 0; i < this.ing_platos.length; i++){
      arrIng.push(this.ing_platos[i].uid);
    }
    this.datosForm.get('ingredientes')?.setValue(arrIng);
    this.datosForm.get('colegio')?.setValue(this.usuarioService.colegio);
    console.log(this.datosForm);
    this.platoservicio.crearPlato(this.datosForm.value).subscribe((res: any) => {
      this.waiting = false;
      let nombre = res['plato'].nombre;
      Swal.fire({
        title: 'Plato creado',
        text: `El Plato ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('super/platos');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el plato, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  campoNoValido(campo: string) {
    return (this.datosForm.get(campo)?.invalid && !this.datosForm.get(campo)?.pristine ||
            this.datosFormEdit.get(campo)?.invalid && !this.datosFormEdit.get(campo)?.pristine);
  }

  cancelar() {
    this.router.navigateByUrl('/super/platos');
  }

}
