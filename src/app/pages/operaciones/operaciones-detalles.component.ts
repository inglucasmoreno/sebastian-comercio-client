import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { format } from 'date-fns';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { ComprasService } from 'src/app/services/compras.service';
import { OperacionesService } from 'src/app/services/operaciones.service';
import { VentasPropiasService } from 'src/app/services/ventas-propias.service';
import { OperacionesVentasPropiasService } from '../../services/operaciones-ventas-propias.service';
import { AuthService } from 'src/app/services/auth.service';
import { OperacionesComprasService } from 'src/app/services/operaciones-compras.service';

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
  public showModalDetallesVenta = false;
  public showModalDetallesCompra = false;

  // Ventas propias
  public parametroVentasPropias: string = '';
  public ventasPropias: any[] = [];
  public operacionVentaPropiaSeleccionada: any = {};

  // Compras
  public parametroCompras: string = '';
  public compras: any[] = [];
  public operacionCompraSeleccionada: any = {};

  // Operacion
  public operacion: any = {
    numero: 1
  };

  public fecha_operacion: string = '';
  public operacionVentasPropias = [];
  public operacionCompras = [];

  constructor(
    private authService: AuthService,
    private operacionesService: OperacionesService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private ventasPropiasService: VentasPropiasService,
    private comprasService: ComprasService,
    private operacionesVentasPropiasService: OperacionesVentasPropiasService,
    private operacionesComprasService: OperacionesComprasService
  ) { }

  // Inicio de componente
  ngOnInit(): void {
    this.alertService.loading();
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {

        // Se obtiene la operacion mediante el operacionesService
        this.operacionesService.getOperacion(id).subscribe({
          next: ({ operacion, operacionVentasPropias, operacionCompras }) => {
            this.operacion = operacion;
            this.operacionVentasPropias = operacionVentasPropias;
            this.operacionCompras = operacionCompras;
            this.fecha_operacion = format(new Date(operacion.fecha_operacion), 'yyyy-MM-dd');
            this.ordenarOperacionesVentasPropias();
            this.ordenarOperacionesCompras();
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar fecha de operacion
  public actualizarFechaOperacion(): void {

    // Se verifica que hay fecha de operacion
    if (!this.fecha_operacion) return this.alertService.info('Fecha invalida');

    this.alertService.loading();

    this.operacionesService.actualizarOperacion(this.operacion._id, {
      fecha_operacion: this.fecha_operacion
    }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Abrir modal - Vincular venta
  public openModalVincularVenta(): void {
    this.parametroVentasPropias = '';
    this.alertService.loading();
    this.ventasPropiasService.listarVentas({
      columna: 'createdAt',
      direccion: -1,
      parametro: this.parametroVentasPropias
    }).subscribe({
      next: ({ ventas }) => {
        this.ventasPropias = ventas;
        this.showModalVincularVenta = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar ventas propias
  public listarVentasPropias(): void {
    this.alertService.loading();
    this.ventasPropiasService.listarVentas({
      columna: 'createdAt',
      direccion: -1,
      parametro: this.parametroVentasPropias
    }).subscribe({
      next: ({ ventas }) => {
        this.ventasPropias = ventas;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Abrir modal - Vincular compra
  public openModalVincularCompra(): void {
    this.parametroCompras = '';
    this.alertService.loading();
    this.comprasService.listarCompras({
      columna: 'createdAt',
      direccion: -1,
      parametro: this.parametroCompras
    }).subscribe({
      next: ({ compras }) => {
        this.compras = compras;
        this.showModalVincularCompra = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Listar compras
  public listarCompras(): void {
    this.alertService.loading();
    this.comprasService.listarCompras({
      columna: 'createdAt',
      direccion: -1,
      parametro: this.parametroCompras
    }).subscribe({
      next: ({ compras }) => {
        this.compras = compras;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Abrir modal - Detalles venta
  public openModalDetallesVenta(relacion: any): void {
    this.operacionVentaPropiaSeleccionada = relacion;
    this.showModalDetallesVenta = true;
  }

  // Abrir modal - Detalles compra
  public openModalDetallesCompra(relacion: string): void {
    this.operacionCompraSeleccionada = relacion;
    this.showModalDetallesCompra = true;
  }

  // Seleccionar venta
  agregarVenta(idVentaPropia: string): void {
    this.alertService.loading();
    const data = {
      operacion: this.operacion._id,
      venta_propia: idVentaPropia,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    this.operacionesVentasPropiasService.nuevaOperacionVentaPropia(data).subscribe({
      next: ({ operacionVentaPropia }) => {
        this.operacionVentasPropias.push(operacionVentaPropia);
        this.ordenarOperacionesVentasPropias();
        this.alertService.close();
        this.showModalVincularVenta = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Seleccionar compra
  agregarCompra(idCompra: string): void {
    this.alertService.loading();
    const data = {
      operacion: this.operacion._id,
      compra: idCompra,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };
    this.operacionesComprasService.nuevaOperacionCompra(data).subscribe({
      next: ({ operacionCompra }) => {
        this.operacionCompras.push(operacionCompra);
        this.ordenarOperacionesCompras();
        this.alertService.close();
        this.showModalVincularCompra = false;
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Eliminar OperacionVentaPropia
  eliminarOperacionVentaPropia(): void {
    this.alertService.loading();
    this.operacionesVentasPropiasService.eliminarOperacionVentaPropia(this.operacionVentaPropiaSeleccionada._id).subscribe({
      next: () => {
        this.operacionVentasPropias = this.operacionVentasPropias.filter(operacionVentaPropia => operacionVentaPropia._id !== this.operacionVentaPropiaSeleccionada._id);
        this.showModalDetallesVenta = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Eliminar OperacionCompra
  eliminarOperacionCompra(): void {
    this.alertService.loading();
    this.operacionesComprasService.eliminarOperacionCompra(this.operacionCompraSeleccionada._id).subscribe({
      next: () => {
        this.operacionCompras = this.operacionCompras.filter(operacionCompra => operacionCompra._id !== this.operacionCompraSeleccionada._id);
        this.showModalDetallesCompra = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Ordenar operacionesVentasPropias por fecha createdAt descendente
  ordenarOperacionesVentasPropias(): void {
    this.operacionVentasPropias.sort((a, b) => {
      if (a.venta_propia.createdAt < b.venta_propia.createdAt) return 1;
      if (a.venta_propia.createdAt > b.venta_propia.createdAt) return -1;
      return 0;
    })
  }

  // Ordenar operacionesCompras por fecha createdAt descendente
  ordenarOperacionesCompras(): void {
    this.operacionCompras.sort((a, b) => {
      if (a.compra.createdAt < b.compra.createdAt) return 1;
      if (a.compra.createdAt > b.compra.createdAt) return -1;
      return 0;
    })
  }

}
