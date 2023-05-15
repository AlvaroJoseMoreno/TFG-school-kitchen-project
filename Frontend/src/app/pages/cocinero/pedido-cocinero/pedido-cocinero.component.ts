import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from 'src/app/modelos/usuario.model';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Ingrediente } from 'src/app/modelos/ingrediente.model';
import { IngredienteService } from 'src/app/servicios/ingrediente.service';
import { MatTableDataSource } from '@angular/material/table';
import { PedidoService } from 'src/app/servicios/pedido.service';

@Component({
  selector: 'app-pedido-cocinero',
  templateUrl: './pedido-cocinero.component.html',
  styleUrls: ['./pedido-cocinero.component.css']
})
export class PedidoCocineroComponent implements OnInit {

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
  public exist_colegio = false;
  public select_proveedor = false;
  public total_pedido = 0;
  public ing_pedidos: Ingrediente [] = [];
  public cantidad_ing: number [] = [];
  public proveedorIng: Usuario = new Usuario('', '');
  displayedColumns: string[] = ['nombre', 'cantidad', 'total', 'borrar'];
  public dataSource: any;

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    proveedor: ['', Validators.required],
    fecha_esperada: [ '', Validators.required],
    anotaciones: [''],
    ingredientes: [''],
    ingerpedidos: [[], Validators.required],
    cantidad: [[], Validators.required]
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private ingredienteServicio: IngredienteService,
              private pedidoServicio: PedidoService,
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
    this.getProveedores();
  }

  private filtro(): Usuario[] {
    return this.proveedores.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.proveedor.toLowerCase()));
  }

  private filtroIngredientes(): Ingrediente[] {
    return this.ingredientes.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.ingredientes.toLowerCase()));
  }

  getProveedores() {
    this.usuarioService.getUsuarios('', 'ROL_PROVEEDOR', this.usuarioService.colegio).subscribe((res: any) => {
      this.proveedores = res['usuarios'];
      this.filteredOptions = this.filterProveedor.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  selectProveedor(){
    if(this.datosForm.get('proveedor')?.value.length > 0){
      this.select_proveedor = true;
    }
  }

  selecProveedorTrueKey(event: any){
    let value_proveedor = this.datosForm.get('proveedor')?.value || '';
    for(let i = 0; i < this.proveedores.length; i++){
      if(this.proveedores[i].nombre == value_proveedor){
        this.select_proveedor = false;
        this.proveedorIng = this.proveedores[i];
        this.ing_pedidos = [];
        this.cantidad_ing = [];
        this.total_pedido = 0;
        this.getIngredientes(this.proveedores[i].uid);
      }
    }
  }

  getIngredientes(proveedor: string) {
    this.ingredienteServicio.getIngredientes('', proveedor).subscribe((res: any) => {
      this.ingredientes = res['ingredientes'];
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
    this.total_pedido = 0;
    console.log(event);
    let v = document.getElementById(event) as HTMLInputElement;
    this.cantidad_ing[index] = Number(v.value);
    for(let i = 0; i < this.cantidad_ing.length; i++){
      this.total_pedido += this.cantidad_ing[i] * this.ing_pedidos[i].precio;
    }
    this.total_pedido.toFixed(2);
    this.datosForm.get('cantidad')?.setValue(this.cantidad_ing);
    console.log(this.datosForm);
  }

  selecIngredienteTrueKey(event: any){
    let value_ing = this.datosForm.get('ingredientes')?.value || '';
    for(let i = 0; i < this.ingredientes.length; i++){
      if(this.ingredientes[i].nombre == value_ing){
        this.ing_pedidos.push(this.ingredientes[i]);
        this.cantidad_ing.push(0);
        console.log(this.ing_pedidos);
        this.ingredientes.splice(i, 1);
        this.dataSource = new MatTableDataSource<Ingrediente>(this.ing_pedidos);
        this.datosForm.get('ingredientes')?.setValue('');
        this.filteredOptionsIngredientes = null;
        this.datosForm.get('ingerpedidos')?.setValue(this.ing_pedidos);
        console.log(this.ingredientes);
        console.log(this.datosForm);
      }
    }
  }

  borrarIngrediente(i: number){
    this.ingredientes.push(this.ing_pedidos[i]);
    this.ing_pedidos.splice(i, 1);
    this.cantidad_ing.splice(i, 1);
    this.dataSource = new MatTableDataSource<Ingrediente>(this.ing_pedidos);
    this.datosForm.get('ingerpedidos')?.setValue(this.ing_pedidos);
    this.datosForm.get('cantidad')?.setValue(this.cantidad_ing);
    this.total_pedido = 0;
    for(let x = 0; x < this.cantidad_ing.length; x++){
      this.total_pedido += this.cantidad_ing[x] * this.ing_pedidos[x].precio;
    }
  }

  setTypeProveedor(tipo: any): string{
    let tipo_proveedor = '';
    switch (tipo) {
      case 'CARNE':
        tipo_proveedor = 'carne'
        break;
      case 'PESCADO':
        tipo_proveedor = 'pescado'
        break;
      case 'FRUTAVERDURA':
        tipo_proveedor = 'fruta y verdura'
        break;
      case 'LACTEOS':
        tipo_proveedor = 'lacteos'
        break;
      case 'ESPECIAS':
        tipo_proveedor = 'especias'
        break;
      case 'DULCES':
        tipo_proveedor = 'dulces'
        break;
      default:
        break;
    }
    return tipo_proveedor;
  }

  crearPedido(){
    this.waiting = true;
    let arrIng = [];
    this.datosForm.value.proveedor = this.proveedorIng.uid;
    for(let i = 0; i < this.ing_pedidos.length; i++){
      arrIng.push(this.ing_pedidos[i].uid);
    }
    this.datosForm.value.ingredientes = arrIng;
    console.log(this.datosForm);
    this.pedidoServicio.crearPedido(this.datosForm.value).subscribe((res: any) => {
      this.waiting = false;
      let nombre = res['pedido'].nombre;
      Swal.fire({
        title: 'Pedido creado',
        text: `El pedido ${nombre} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('cocinero/pedidos');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el pedido, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }


  cancelar() {
    this.router.navigateByUrl('/cocinero/pedidos');
  }

}
