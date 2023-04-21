import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Output() public propagar = new EventEmitter();

  public titulo: string = '';
  private subs$: Subscription;
  // https://www.youtube.com/watch?v=4CYuOiRHHA8
  constructor(private router: Router) {
    this.subs$ = this.cargarDatos()
                      .subscribe( data => {
                        console.log(data);
                        this.titulo = data.titulo;
                      });
  }

  ngOnInit(): void {
  }

  onPropagar(){
    console.log('Entro');
    this.propagar.emit();
  }

  ngOnDestroy() {
    this.subs$.unsubscribe();
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
