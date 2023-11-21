import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { format } from 'date-fns';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { OperacionesService } from 'src/app/services/operaciones.service';

@Component({
  selector: 'app-operaciones-detalles',
  templateUrl: './operaciones-detalles.component.html',
  styles: [
  ]
})
export class OperacionesDetallesComponent implements OnInit {

  // Modals
  public showModalVincularVenta = false;
  public showModalVincularCompra = false;

  // Operacion
  public operacion: any = {
    numero: 1
  };

  public fecha_operacion: string = '';
  public operacionVentasPropias = [];
  public operacionCompras = [];

  constructor(
    private operacionesService: OperacionesService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) { }

  // Inicio de componente
  ngOnInit(): void {
    this.alertService.loading();
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {

        // Se obtiene la operacion mediante el operacionesService
        this.operacionesService.getOperacion(id).subscribe({
          next: ({ operacion, operacionVentasPropias, operacionCompras }) => {
            this.operacion = operacion;
            this.operacionVentasPropias = operacionVentasPropias;
            this.operacionCompras = operacionCompras;
            this.fecha_operacion = format(new Date(operacion.fecha_operacion), 'yyyy-MM-dd');
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar fecha de operacion
  public actualizarFechaOperacion(): void {

    // Se verifica que hay fecha de operacion
    if(!this.fecha_operacion) return this.alertService.info('Fecha invalida');

    this.alertService.loading();

    this.operacionesService.actualizarOperacion(this.operacion._id,{
      fecha_operacion: this.fecha_operacion
    }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Abrir modal - Vincular venta
  public openModalVincularVenta(): void {
    this.showModalVincularVenta = true;
  }

  // Abrir modal - Vincular compra
  public openModalVincularCompra(): void {
    this.showModalVincularCompra = true;
  }


}
