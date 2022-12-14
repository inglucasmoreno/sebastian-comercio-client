import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ComprasChequesService } from 'src/app/services/compras-cheques.service';
import { ComprasProductosService } from 'src/app/services/compras-productos.service';
import { ComprasService } from 'src/app/services/compras.service';
import { DataService } from 'src/app/services/data.service';
import { OrdenesPagoChequesService } from 'src/app/services/ordenes-pago-cheques.service';
import { OrdenesPagoCompraService } from 'src/app/services/ordenes-pago-compra.service';
import { OrdenesPagoService } from 'src/app/services/ordenes-pago.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styles: [
  ]
})
export class PagosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalOrdenPago = false;
  public showModalDetallesCheque = false;
  public showModalDetallesCompra = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Orden de pago
  public idOrdenPago: string = '';
  public ordenes_pago: any = [];
  public ordenPagoSeleccionada: any;
  public descripcion: string = '';
  public chequeSeleccionado: any;
  public totalEnCompras: number = 0;

  // Cheques
  public relaciones_cheques: any[] = [];
  public relaciones_compras: any[] = [];

  // Compra
  public compra: any = null;
  public compra_cheques: any[] = [];
  public productos: any[] = [];
  public ordenesPago: any[] = [];

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;
  public desde: number = 0;

  // Otros
  public origen = 'pago';

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    parametroProducto: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(
    private ordenesPagoService: OrdenesPagoService,
    private chequesService: OrdenesPagoChequesService,
    private ordenesPagoCompraService: OrdenesPagoCompraService,
    private authService: AuthService,
    private comprasService: ComprasService,
    private comprasChequesService: ComprasChequesService,
    private comprasProductosService: ComprasProductosService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ordenes de pago';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarOrdenesPago();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('PAGOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Traer datos de orden de pago
  getOrdenPago(orden_pago: any): void {
    this.alertService.loading();
    this.idOrdenPago = orden_pago._id;
    this.ordenPagoSeleccionada = orden_pago;
    this.ordenesPagoService.getOrdenPago(orden_pago._id).subscribe(({ orden_pago }) => {
      this.descripcion = orden_pago.descripcion;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar ordenes de pago
  listarOrdenesPago(): void {
    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      desde: this.desde,
      cantidadItems: this.cantidadItems,
      activo: this.filtro.activo,
      parametro: this.filtro.parametro
    }
    this.ordenesPagoService.listarOrdenesPago(parametros)
      .subscribe(({ ordenes_pago, totalItems }) => {
        this.ordenes_pago = ordenes_pago;
        this.totalItems = totalItems;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nueva orden de pago
  nuevaOrdenPago(): void {

    // Verificacion: Descripci??n vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripci??n');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.ordenesPagoService.nuevaOrdenPago(data).subscribe(() => {
      this.listarOrdenesPago();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar orden de pago
  actualizarOrdenPago(): void {

    // Verificacion: Descripci??n vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripci??n');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      updatorUser: this.authService.usuario.userId,
    }

    this.ordenesPagoService.actualizarOrdenPago(this.idOrdenPago, data).subscribe(() => {
      this.listarOrdenesPago();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(orden_pago: any): void {

    const { _id, activo } = orden_pago;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acci??n');

    this.alertService.question({ msg: '??Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ordenesPagoService.actualizarOrdenPago(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarOrdenesPago();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Abrir detalles de orden de pago
  abrirDetallesOrdenPago(orden_pago: any): void {

    this.totalEnCompras = 0;

    this.alertService.loading();

    // Se obtienen las relaciones ORDEN PAGO - CHEQUE
    this.chequesService.listarRelaciones({ orden_pago: orden_pago._id }).subscribe({
      next: ({ relaciones }) => {
        this.relaciones_cheques = relaciones;

        // Se obtienen las relaciones ORDEN PAGO - COMPRAS
        this.ordenesPagoCompraService.listarRelaciones({ orden_pago: orden_pago._id }).subscribe({
          next: ({ relaciones }) => {
            this.relaciones_compras = relaciones;
            this.ordenPagoSeleccionada = orden_pago;
            relaciones.map( relacion => this.totalEnCompras += relacion.monto_pagado );
            this.alertService.close();
            this.showModalOrdenPago = true;
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  abrirDetallesCheque(cheque: any, origen: any): void {

    this.chequeSeleccionado = cheque;
    this.origen = origen;

    if (origen === 'pago') {
      this.showModalOrdenPago = false;
      this.showModalDetallesCheque = true;
    } else if (origen === 'compra') {
      this.showModalDetallesCompra = false;
      this.showModalDetallesCheque = true;
    }

  }

  // Cerrar el detalles del cheque
  cerrarDetallesCheque(): void {

    if (this.origen === 'pago') {
      this.showModalOrdenPago = true;
      this.showModalDetallesCheque = false;
    } else if (this.origen === 'compra') {
      this.showModalDetallesCompra = true;
      this.showModalDetallesCheque = false;
    }

  }

  // Abrir detalles de compra
  abrirDetallesCompra(idCompra: string): void {

    this.alertService.loading();

    this.comprasService.getCompra(idCompra).subscribe({
      next: ({ compra }) => {
        this.compra = compra;

        this.comprasProductosService.listarProductos({ compra: compra._id }).subscribe({
          next: ({ productos }) => {
            this.productos = productos;

            this.comprasChequesService.listarRelaciones({ compra: compra._id }).subscribe({
              next: ({ relaciones }) => {

                this.compra_cheques = relaciones;

                // Se obtienen las ordenes de pago
                this.ordenesPagoCompraService.listarRelaciones({ compra: compra._id }).subscribe({
                  next: ({ relaciones }) => {
                    
                    this.ordenesPago = relaciones;
                    this.showModalOrdenPago = false;
                    this.showModalDetallesCompra = true;
                    this.alertService.close();

                  }, error: ({ error }) => this.alertService.errorApi(error.message)
                })

                this.showModalOrdenPago = false;
                this.showModalDetallesCompra = true;
                this.alertService.close();

              }, error: ({ error }) => this.alertService.errorApi(error.message)
            })

          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Cerrar detalles de compra
  cerrarDetallesCompra(): void {
    this.showModalOrdenPago = true;
    this.showModalDetallesCompra = false;
  }

  // Generar PDF
  generarPDF(orden_pago: any): void {
    this.alertService.loading();
    this.ordenesPagoService.generarPDF({ orden_pago: orden_pago._id }).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/orden_pago.pdf`, '_blank');
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.descripcion = '';
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarOrdenesPago();
  }

  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarOrdenesPago();
  }


}
