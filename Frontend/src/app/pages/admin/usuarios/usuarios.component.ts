import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/modelos/usuario.model';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
import { Colegio } from 'src/app/modelos/colegio.model';
import { ColegioService } from 'src/app/servicios/colegio.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  public usuarios: Usuario [] = [];
  public colegios: Colegio [] = [];
  public length = 0;
  public pageSize = 5;
  public pageIndex = 0;
  public pageSizeOptions = [5, 10, 25];
  public dataSource: any;
  public filterColegio = new FormControl();
  public filteredOptions!: Observable<Colegio[]>;

  public searchForm = this.fb.group({
    text: [''],
    rol: [''],
    colegio: ['']
  });

  public subs$!: Subscription;

  public hidePageSize = false;
  public showPageSizeOptions = true;
  public showFirstLastButtons = true;
  public disabled = false;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  public pageEvent: PageEvent | undefined;

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  displayedColumns: string[] = ['Nombre', 'Email', 'Rol', 'Colegio', 'borrar'];

  constructor(private usuarioservicio: UsuarioService,
              private paginator1: MatPaginatorIntl,
              private fb: FormBuilder,
              private colegioservicio: ColegioService) {
                this.paginator1.itemsPerPageLabel = "Registros por página";
               }

  ngOnInit(): void {
    this.getUsuarios();
    this.getColegios();
    this.subs$ = this.searchForm.valueChanges
      .pipe(debounceTime(500),
            distinctUntilChanged())
      .subscribe( event => {
        this.getUsuarios();
      });
  }

  private filtro(): Colegio[] {
    return this.colegios.filter(option => option.nombre!.toLowerCase().includes(this.searchForm.value.colegio.toLowerCase()));
  }

  getColegios() {
    this.colegioservicio.getColegios('', '').subscribe((res: any) => {
      console.log(res);
      this.colegios = res['colegios'];
      this.filteredOptions = this.filterColegio.valueChanges.pipe(
        startWith(''),
        map(value => this.filtro()),
      );
    });
  }

  getUsuarios(){
    const texto = this.searchForm.get('text')?.value || '';
    const rol = this.searchForm.get('rol')?.value || '';
    const colegio = this.obtainColegioId() || '';

    if(this.searchForm.get('colegio')?.value.length > 0 && colegio == '') { return; }

    this.usuarioservicio.getUsuarios(texto, rol, colegio).subscribe((res: any) => {
        this.usuarios = res['usuarios'];
        this.length = res['usuarios'].length;
        this.dataSource = new MatTableDataSource<Usuario>(this.usuarios);
        this.dataSource.paginator = this.paginator;
        this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
          const start = page * pageSize + 1;
          let end = (page + 1) * pageSize;

          if(end > length)
            end = length

          return `página ${start} - ${end} de ${length}`;
        };
      console.log(res);
    });
  }

  obtainColegioId(): string {
    let col = '';
    let bool = false;
    for(let x = 0; x < this.colegios.length; x++){
      if(this.colegios[x].nombre === this.searchForm.get('colegio')?.value){
        bool = true;
        this.searchForm.value.colegio = this.colegios[x].uid;
        break;
      }
    }
    if(this.searchForm.get('colegio')?.value.length > 0 && !bool) { return ''; }

    if(bool){
      col = this.searchForm.value.colegio;
    }
    return col;
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => + str);
    }
  }

  borrarUsuario(uid: string, name: string): void {
      // Comprobar que no me borro a mi mismo
      if (uid === this.usuarioservicio.uid) {
        Swal.fire({icon: 'warning', title: 'Oops...', text: 'No puedes eliminar tu propio usuario',});
        return;
      }
      // Solo los admin pueden borrar usuarios
      if (this.usuarioservicio.rol !== 'ROL_ADMIN') {
        Swal.fire({icon: 'warning', title: 'Oops...', text: 'No tienes permisos para realizar esta acción',});
        return;
      }
      Swal.fire({
        title: 'Eliminar usuario',
        text: `Al eliminar al usuario ${name} se perderán todos los datos asociados. ¿Desea continuar?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, borrar'
      }).then((result) => {
            if (result.value) {
              this.usuarioservicio.borrarUsuario(uid)
                .subscribe( resp => {
                  console.log(resp);
                  this.getUsuarios();
                }
                ,(err) =>{
                  console.log(err);
                  Swal.fire({icon: 'error', title: 'Oops...', text: err.error.msg || 'No se pudo completar la acción, vuelva a intentarlo',});
                })
            }
        });
  }

  borrar() {
    this.searchForm.controls['text'].reset();
    this.searchForm.controls['rol'].setValue('');
    this.searchForm.controls['colegio'].setValue('');
  }

}
