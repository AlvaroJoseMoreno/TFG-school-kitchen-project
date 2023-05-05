import { Component, OnInit } from '@angular/core';
import { Provincia } from 'src/app/modelos/provincia.model';
import { ProvinciaService } from 'src/app/servicios/provincia.service';
import { Chart, registerables } from 'chart.js';
import { ComensalService } from 'src/app/servicios/comensal.service';

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
  constructor(private provinciaServicio: ProvinciaService,
              private comensaleServicio: ComensalService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.getColegiosPorProvincias();
    this.getComensalesPorDia();
  }

  getComensalesPorDia(){

    this.comensaleServicio.getComensalesPorDia('2023-04-03', '2023-04-08').subscribe((res: any) => {
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
        var fechaInicio = new Date('2023-04-03');
        var fechaFin = new Date('2023-04-08');

        while(fechaFin.getTime() >= fechaInicio.getTime()){
            labels_com.push(fechaInicio.getDate() + '-' + (fechaInicio.getMonth() + 1) + '-' + fechaInicio.getFullYear())
            fechaInicio.setDate(fechaInicio.getDate() + 1);
        }

        console.log(fechas);
        console.log(labels_com);

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

        console.log(label_fin);

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
      console.log(res);
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
