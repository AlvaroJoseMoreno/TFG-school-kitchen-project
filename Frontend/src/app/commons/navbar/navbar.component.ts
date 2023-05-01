import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Output() public propagar = new EventEmitter();

  public titulo: string = '';
  private subs$: Subscription;
  public colegio: string = '';
  public nombre: string = '';
  public rol: string = '';
  // https://www.youtube.com/watch?v=4CYuOiRHHA8
  constructor(private usuarioservicio: UsuarioService,
              private router: Router) {
    this.subs$ = this.cargarDatos()
                      .subscribe( data => {
                        this.titulo = data.titulo;
                      });
  }

  ngOnInit(): void {
    this.getUser();
  }

  onPropagar(){
    console.log('Entro');
    this.propagar.emit();
  }

  ngOnDestroy() {
    this.subs$.unsubscribe();
  }

  logout(){
    this.usuarioservicio.logout();
  }

  getUser(){
    this.usuarioservicio.getUsuario(this.usuarioservicio.uid).subscribe((res: any) => {
      if(this.colegio = res['usuarios'].colegio) this.colegio = res['usuarios'].colegio.nombre;
      this.nombre = res['usuarios'].nombre;
      this.rol = res['usuarios'].rol;
      console.log(res);
    });
  }

  cargarDatos() {
    return this.router.events
      .pipe(
        filter( (event): event is ActivationEnd => event instanceof ActivationEnd ),
        filter( (event: ActivationEnd) => event.snapshot.firstChild === null),
        map( (event: ActivationEnd) => event.snapshot.data)
      );
  }

}
