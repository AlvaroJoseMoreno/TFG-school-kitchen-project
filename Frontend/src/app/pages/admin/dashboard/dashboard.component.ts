import { Component, OnInit } from '@angular/core';
import { Provincia } from 'src/app/modelos/provincia.model';
import { ProvinciaService } from 'src/app/servicios/provincia.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  public provincias: Provincia [] = [];
  public myChart: any;
  constructor(private provinciaServicio: ProvinciaService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.getColegiosPorProvincias();
  }

  getColegiosPorProvincias(){
    this.provinciaServicio.getProvinciasByColegio().subscribe((res: any) => {
      console.log(res);
      this.provincias = res['provincias'];
      if(this.provincias.length > 0){

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
                backgroundColor: ['#940BAA', '#940BAA', '#940BAA', '#940BAA', '#940BAA'],
                borderColor: ['#940BAA', '#940BAA', '#940BAA', '#940BAA', '#940BAA'],
                borderWidth: 1
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
