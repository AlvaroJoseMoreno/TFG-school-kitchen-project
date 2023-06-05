import { Component, OnInit } from '@angular/core';
import { Provincia } from 'src/app/modelos/provincia.model';
import { ProvinciaService } from 'src/app/servicios/provincia.service';
import { Chart, registerables } from 'chart.js';
import { ComensalService } from 'src/app/servicios/comensal.service';
import { FormControl, FormGroup } from '@angular/forms';
import { UsuarioService } from 'src/app/servicios/usuario.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public provincias: Provincia [] = [];
  public Comensales: any [] = [];
  public myChart: any;
  public myChart2: any;
  public total_usuarios = 0;
  public total_colegios = 0;
  public total_comensales = 0;
  public total_pedidos = 0;
  public total_dinero = 0;
  public dateRangeComensales = new FormGroup({
    start: new FormControl(new Date(2023, 4, 29)),
    end: new FormControl(new Date(2023, 5, 4)),
  });

  constructor(private provinciaServicio: ProvinciaService,
              private usuarioServicio: UsuarioService,
              private comensaleServicio: ComensalService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.getColegiosPorProvincias();
    this.getComensalesPorDia();
    this.getMetricasAdmin();
  }

  getMetricasAdmin(): void {
    this.usuarioServicio.getMetricarAdmin().subscribe((res: any) => {
      this.total_usuarios = res['total_usu'];
      this.total_colegios = res['total_colegios'];
      this.total_pedidos = res['total_pedidos'];
      this.total_comensales = res['total_comensales'];
      this.total_dinero = res['total_dinero'];
    });
  }

  getComensalesPorDia(){
    let fechain = this.dateRangeComensales.get('start')?.value;
    let fechafin = this.dateRangeComensales.get('end')?.value;
    let date1 = new Date(fechain).toLocaleDateString('es-CL').split('-');
    let date2 = new Date(fechafin).toLocaleDateString('es-CL').split('-');
    let datefin1 = date1[2] + '-' + date1[1] + '-' + date1 [0];
    let datefin2 = date2[2] + '-' + date2[1] + '-' + date2 [0];
    this.comensaleServicio.getComensalesPorDia(datefin1, datefin2).subscribe((res: any) => {
      this.Comensales = res['date_comensales'];
      let labels_com: any = [];
      let data_com: any = [];
      let label_fin: any = [];
      let fechas = [];
      if(this.Comensales.length > 0){
        for(let i = 0; i < this.Comensales.length; i++){
          let fec1 = new Date(this.Comensales[i].fecha);
          let fec2 = fec1.getDate() + '-' + (fec1.getMonth() + 1) + '-' + fec1.getFullYear();
          fechas.push(fec2);
          data_com.push(this.Comensales[i].num_comensales);
        }
        //data_com.splice(2, 0, 0);
        var fechaInicio = new Date(datefin1);
        var fechaFin = new Date(datefin2);

        while(fechaFin.getTime() >= fechaInicio.getTime()){
            labels_com.push(fechaInicio.getDate() + '-' + (fechaInicio.getMonth() + 1) + '-' + fechaInicio.getFullYear())
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        }

        for(let i = 0; i < labels_com.length; i++){
          var igual = false;
          for (let j = 0; j < labels_com.length; j++) {
            if(labels_com[i] == fechas[j]){
               igual=true;
            }
          }
          if(!igual) {
            label_fin.push(labels_com[i]);
            data_com.splice(i, 0, 0);
          }
        }

        if(this.myChart){
          this.myChart.destroy();
        }

        const ch1 = <HTMLCanvasElement> document.getElementById('myChart');
          if(!document.getElementById('myChart')) { return; }
        const ctx1 = ch1.getContext('2d')
        if (!ctx1 || !(ctx1 instanceof CanvasRenderingContext2D)) {
          throw new Error('Failed to get 2D context');
        }
        const ctx = ctx1;
        if(this.myChart){
          this.myChart.destroy();
        }
        this.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels_com,
            datasets: [{
                label: 'Número de comensales por día',
                data: data_com,
                borderRadius: 6,
                backgroundColor: ['violet', 'violet', 'violet', 'violet', 'violet'],
                borderColor: ['#940BAA', '#940BAA', '#940BAA', '#940BAA', '#940BAA'],
                borderWidth: 3
            }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              suggestedMin: 0,
              ticks: { precision: 0 }
            }
          }
        }
      });
      }
    }, (err) => {
        console.log(err);
    });
  }

  getColegiosPorProvincias(){
    this.provinciaServicio.getProvinciasByColegio().subscribe((res: any) => {
      this.provincias = res['provincias'];
      if(this.provincias.length > 0){

        if(this.myChart2){
          this.myChart2.destroy();
        }

        const ch1 = <HTMLCanvasElement> document.getElementById('myChart2');
          if(!document.getElementById('myChart2')) { return; }
        const ctx1 = ch1.getContext('2d')
        if (!ctx1 || !(ctx1 instanceof CanvasRenderingContext2D)) {
          throw new Error('Failed to get 2D context');
        }
        const ctx = ctx1;
        if(this.myChart2){
          this.myChart2.destroy();
        }
        this.myChart2 = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [this.provincias[0].nombre || '', this.provincias[1].nombre || '', this.provincias[2].nombre || '',
                     this.provincias[3].nombre || '', this.provincias[4].nombre || ''],
            datasets: [{
                label: 'Colegios por provincias',
                data: [
                       this.provincias[0].num_colegios || 0,
                       this.provincias[1].num_colegios || 0,
                       this.provincias[2].num_colegios || 0,
                       this.provincias[3].num_colegios || 0,
                       this.provincias[4].num_colegios || 0,
                      ],
                borderRadius: 6,
                backgroundColor: ['violet', 'violet', 'violet', 'violet', 'violet'],
                borderColor: ['#940BAA', '#940BAA', '#940BAA', '#940BAA', '#940BAA'],
                borderWidth: 3
            }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
            },
            y: {
              suggestedMin: 0,
              ticks: { precision: 0 }
            }
          }
        }
      });
      }
    }, (err) => {
        console.log(err);
    });
  }

}
