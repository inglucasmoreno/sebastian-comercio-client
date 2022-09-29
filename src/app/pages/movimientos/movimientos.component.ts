import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { MovimientosService } from 'src/app/services/movimientos.service';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styles: [
  ]
})
export class MovimientosComponent implements OnInit {

  showModalCreacion = false;

  constructor(private movimientosService: MovimientosService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Movimientos';
  }

  abrirModalCreacion(): void {
    this.showModalCreacion = true;
  }

}
