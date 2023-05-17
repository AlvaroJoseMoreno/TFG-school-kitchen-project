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
import Swal from 'sweetalert2';
import { MenuService } from 'src/app/servicios/menu.service';

@Component({
  selector: 'app-menu-super',
  templateUrl: './menu-super.component.html',
  styleUrls: ['./menu-super.component.css']
})
export class MenuSuperComponent implements OnInit {

  private formSubmited = false;
  public primerPlato: Plato [] = [];
  public segundoPlato: Plato [] = [];
  public ensaladaMenu: Plato [] = [];
  public postres: Ingrediente [] = [];
  public filterPrimerPlato = new FormControl();
  public filterSegundoPlato = new FormControl();
  public filterEnsaladas = new FormControl();
  public filterPostres = new FormControl();
  public filteredOptionsPrimerPlato!: Observable<Plato[]> | null;
  public filteredOptionsSegundoPlato!: Observable<Plato[]> | null;
  public filteredOptionsEnsaladas!: Observable<Plato[]> | null;
  public filteredOptionsPostres!: Observable<Ingrediente[]> | null;
  private uid: string = '';
  public waiting = false;
  public wait_form = false;
  public esnuevo = false
  public exist_colegio = false;
  public total_pedido = 0;

  // formulario con el que se creará un nuevo usuario

  public datosForm = this.fb.group({
    uid: [{value: 'nuevo', disabled: true}, Validators.required],
    nombre: ['', Validators.required],
    dia: ['', Validators.required],
    plato1: ['', Validators.required],
    plato2: ['', Validators.required],
    ensalada: ['', Validators.required],
    postre: ['', Validators.required],
    colegio: ['']
  });

  constructor(private fb: FormBuilder,
              private usuarioService: UsuarioService,
              private ingredienteServicio: IngredienteService,
              private platoServicio: PlatoService,
              private menuServicio: MenuService,
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
    this.getEnsaladas();
    this.getPostres();
  }

  private filtroFirstPlate(): Plato[] {
    return this.primerPlato.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.plato1.toLowerCase()));
  }

  getPrimerPlato() {
    this.platoServicio.getPlatosByCategoria('primeros', this.usuarioService.colegio).subscribe((res: any) => {
      this.primerPlato = res['platos'];
      console.log(this.primerPlato);
      this.filteredOptionsPrimerPlato = this.filterPrimerPlato.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroFirstPlate()),
      );
    });
  }

  private filtroSecondPlate(): Plato[] {
    return this.segundoPlato.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.plato2.toLowerCase()));
  }

  getSegundoPlato() {
    this.platoServicio.getPlatosByCategoria('segundos', this.usuarioService.colegio).subscribe((res: any) => {
      this.segundoPlato = res['platos'];
      console.log(this.segundoPlato);
      this.filteredOptionsSegundoPlato = this.filterSegundoPlato.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroSecondPlate()),
      );
    });
  }

  private filtroEnsaladas(): Plato[] {
    return this.ensaladaMenu.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.plato2.toLowerCase()));
  }

  getEnsaladas() {
    this.platoServicio.getPlatosByCategoria('ensaladas', this.usuarioService.colegio).subscribe((res: any) => {
      this.ensaladaMenu = res['platos'];
      console.log(this.ensaladaMenu);
      this.filteredOptionsEnsaladas = this.filterEnsaladas.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroEnsaladas()),
      );
    });
  }

  private filtroPostres(): Ingrediente[] {
    return this.postres.filter(option => option.nombre!.toLowerCase().includes(this.datosForm.value.postre.toLowerCase()));
  }

  getPostres() {
    this.ingredienteServicio.getIngredientes('', '').subscribe((res: any) => {
      let postr = res['ingredientes'];
      this.postres = [];
      for(let i = 0; i < postr.length; i++){
        if(postr[i].proveedor.colegio == this.usuarioService.colegio &&
          (postr[i].proveedor.tipo_proveedor == 'DULCES' || postr[i].proveedor.tipo_proveedor == 'FRUTAVERDURA')){
          this.postres.push(postr[i]);
        }
      }
      console.log(this.postres);
      this.filteredOptionsPostres = this.filterPostres.valueChanges.pipe(
        startWith(''),
        map(value => this.filtroPostres()),
      );
    });
  }


  crearPlato(){
    console.log('Creando plato');
    this.waiting = true;
    /**
     *
            postre: postre,
            ensalada: ensalada,
            coste: coste,
            anotaciones: req.body.anotaciones,
     */
    const data = {
      nombre: this.datosForm.get('nombre')?.value,
      dia: this.datosForm.get('dia')?.value,
      plato1: this.obtainPlato1(this.datosForm.get('plato1')?.value),
      plato2: this.obtainPlato2(this.datosForm.get('plato2')?.value),
      colegio: this.usuarioService.colegio,
      postre: this.obtainPostre(this.datosForm.get('postre')?.value),
      ensalada: this.obtainEnsalada(this.datosForm.get('ensalada')?.value)
    }
    console.log(data);
    this.datosForm.value.colegio = this.usuarioService.colegio;
    console.log(this.datosForm);
    this.menuServicio.crearMenu(data).subscribe((res: any) => {
      this.waiting = false;
      let dia = res['menu'].dia;
      Swal.fire({
        title: 'Menú creado',
        text: `El menú del dia ${new Date(dia).toLocaleDateString()} ha sido creado con éxito`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.router.navigateByUrl('super/menus');
        }
      });
      this.datosForm.markAsPristine();
    }, (err) => {
      console.log(err);
      this.waiting = false;
      const errtext = err.error.msg || 'No se pudo crear el menú, vuelva a intentarlo.';
      Swal.fire({icon: 'error', title: 'Oops...', text: errtext,});
      return;
    });
  }

  obtainPlato1(plato1: string): string{
    for(let i = 0; i < this.primerPlato.length; i++){
      if(this.primerPlato[i].nombre == plato1){
        return this.primerPlato[i].uid;
      }
    }
    return '';
  }

  obtainPlato2(plato2: string): string{
    for(let i = 0; i < this.segundoPlato.length; i++){
      if(this.segundoPlato[i].nombre == plato2){
        return this.segundoPlato[i].uid;
      }
    }
    return '';
  }

  obtainPostre(postre: string): string{
    for(let i = 0; i < this.postres.length; i++){
      if(this.postres[i].nombre == postre){
        return this.postres[i].uid;
      }
    }
    return '';
  }

  obtainEnsalada(ensalada: string): string{
    for(let i = 0; i < this.ensaladaMenu.length; i++){
      if(this.ensaladaMenu[i].nombre == ensalada){
        return this.ensaladaMenu[i].uid;
      }
    }
    return '';
  }

  cancelar() {
    this.router.navigateByUrl('/super/menus');
  }

}
