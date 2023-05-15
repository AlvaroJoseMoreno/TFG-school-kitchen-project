import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { Plato } from 'src/app/modelos/plato.model';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';
import { PlatoService } from 'src/app/servicios/plato.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-menu-super',
  templateUrl: './menu-super.component.html',
  styleUrls: ['./menu-super.component.css']
})
export class MenuSuperComponent implements OnInit {

  private formSubmited = false;
  public primerPlato: Plato [] = [];
  public segundoPlato: Plato [] = [];
  public ingredientes: Ingrediente [] = [];
  public filterPrimerPlato = new FormControl();
  public filterSegundoPlato = new FormControl();
  public filterIngredientes = new FormControl();
  public filteredOptionsPrimerPlato!: Observable<Plato[]> | null;
  public filteredOptionsSegundoPlato!: Observable<Plato[]> | null;
  public filteredOptionsIngredientes!: Observable<Ingrediente[]> | null;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;
  public total_pedido = 0;

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    fecha: ['', Validators.required],
    firstPlate: ['', Validators.required],
    secondPlate: ['', Validators.required],
    anotaciones: [''],
    postre: [''],
    ingerpedidos: [[], Validators.required],
    cantidad: [[], Validators.required]
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private ingredienteServicio: IngredienteService,
              private platoServicio: PlatoService,
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
    this.getPrimerPlato();
    this.getSegundoPlato();
  }

  private filtroFirstPlate(): Plato[] {
    return this.primerPlato.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.firstPlate.toLowerCase()));
  }

  private filtroSecondPlate(): Plato[] {
    return this.segundoPlato.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.secondPlate.toLowerCase()));
  }

  private filtroIngredientes(): Ingrediente[] {
    return this.ingredientes.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.ingredientes.toLowerCase()));
  }

  getPrimerPlato() {
    this.usuarioService.getUsuarios('', 'ROL_PROVEEDOR', this.usuarioService.colegio).subscribe((res: any) => {
      this.primerPlato = res['usuarios'];
      this.filteredOptionsPrimerPlato = this.filterPrimerPlato.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroFirstPlate()),
      );
    });
  }

  getSegundoPlato() {
    this.usuarioService.getUsuarios('', 'ROL_PROVEEDOR', this.usuarioService.colegio).subscribe((res: any) => {
      this.segundoPlato = res['usuarios'];
      this.filteredOptionsSegundoPlato = this.filterSegundoPlato.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroSecondPlate()),
      );
    });
  }

  selecProveedorTrueKey(event: any){
    let value_proveedor = this.datosForm.get('proveedor')?.value || '';
  }

  getIngredientes() {
    this.ingredienteServicio.getIngredientes('').subscribe((res: any) => {
      this.ingredientes = res['ingredientes'];
      this.filteredOptionsIngredientes = this.filterIngredientes.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroIngredientes()),
      );
    });
  }

  selecIngredienteTrueKey(event: any){
    let value_ing = this.datosForm.get('ingredientes')?.value || '';
  }


  crearPlato(){
    this.waiting = true;
    let arrIng = [];
    // this.datosForm.value.proveedor = this.proveedorIng.uid;
    // for(let i = 0; i < this.ing_pedidos.length; i++){
    //   arrIng.push(this.ing_pedidos[i].uid);
    // }
    // this.datosForm.value.ingredientes = arrIng;
    // console.log(this.datosForm);
    // this.pedidoServicio.crearPedido(this.datosForm.value).subscribe((res: any) => {
    //   this.waiting = false;
    //   let nombre = res['pedido'].nombre;
    //   Swal.fire({
    //     title: 'Pedido creado',
    //     text: `El pedido ${nombre} ha sido creado con éxito`,
    //     icon: 'success',
    //     confirmButtonColor: '#3085d6',
    //     confirmButtonText: 'Aceptar'
    //   }).then((result) => {
    //     if (result.value) {
    //       this.router.navigateByUrl('cocinero/pedidos');
    //     }
    //   });
    //   this.datosForm.markAsPristine();
    // }, (err) => {
    //   console.log(err);
    //   this.waiting = false;
    //   const errtext = err.error.msg || 'No se pudo crear el pedido, vuelva a intentarlo.';
    //   Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
    //   return;
    // });
  }


  cancelar() {
    this.router.navigateByUrl('/super/menus');
  }

}
