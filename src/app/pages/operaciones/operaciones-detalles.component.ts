import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import gsap from 'gsap';
import { AlertService } from 'src/app/services/alert.service';
import { ComprasService } from 'src/app/services/compras.service';
import { OperacionesService } from 'src/app/services/operaciones.service';
import { VentasPropiasService } from 'src/app/services/ventas-propias.service';
import { OperacionesVentasPropiasService } from '../../services/operaciones-ventas-propias.service';
import { AuthService } from 'src/app/services/auth.service';
import { OperacionesComprasService } from 'src/app/services/operaciones-compras.service';
import { VentasPropiasProductosService } from '../../services/ventas-propias-productos.service';
import { ComprasProductosService } from 'src/app/services/compras-productos.service';
import { environment } from 'src/environments/environment';
import { VentasPropiasChequesService } from 'src/app/services/ventas-propias-cheques.service';
import { RecibosCobroVentaService } from 'src/app/services/recibos-cobro-venta.service';
import { OrdenesPagoCompraService } from 'src/app/services/ordenes-pago-compra.service';
import { ComprasChequesService } from 'src/app/services/compras-cheques.service';
import { Location } from '@angular/common';

const base_url = environment.base_url;

@Component({
  selector: 'app-operaciones-detalles',
  templateUrl: './operaciones-detalles.component.html',
  styles: [
  ]
})
export class OperacionesDetallesComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Cheques
  public showDetallesCheque = false;
  public chequeSeleccionado: any;

  // Modals
  public showModalVincularVenta = false;
  public showModalVincularCompra = false;
  public showModalDetallesVenta = false;
  public showModalDetallesCompra = false;

  // Ventas propias
  public observacionActualizadaFlag: boolean = false;
  public observacion: string = '';
  public parametroVentasPropias: string = '';
  public ventasPropias: any[] = [];
  public operacionVentaPropiaSeleccionada: any = {};
  public productosVenta: any[] = [];
  public pagoTotal: number = 0;
  public cheques_venta = [];
  public recibosCobro: any[] = [];

  // Compras
  public ordenesPago: any[] = [];
  public cheques_compra = [];
  public parametroCompras: string = '';
  public compras: any[] = [];
  public observacionCompra: string = '';
  public operacionCompraSeleccionada: any = {};
  public productosCompra: any[] = [];
  public pagoTotalCompra: number = 0;

  // Operacion
  public operacion: any = {
    numero: 1,
    observacion: ''
  };

  public fecha_operacion: string = '';
  public operacionVentasPropias = [];
  public operacionCompras = [];

  // Paginacion - Ventas
  public totalItemsVentas: number;
  public desdeVentas: number = 0;
  public paginaActualVentas: number = 1;
  public cantidadItemsVentas: number = 10;

  // Paginacion - Compras
  public totalItemsCompras: number;
  public desdeCompras: number = 0;
  public paginaActualCompras: number = 1;
  public cantidadItemsCompras: number = 10;

  // Filtro
  public filtro: any = {
    parametroProductos: '',
    parametroProductosCompra: '',
  }

  constructor(
    private authService: AuthService,
    private operacionesService: OperacionesService,
    private recibosCobroVentaService: RecibosCobroVentaService,
    private ventasPropiasChequesService: VentasPropiasChequesService,
    private ventasPropiasProductosService: VentasPropiasProductosService,
    private comprasProductosService: ComprasProductosService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private ventasPropiasService: VentasPropiasService,
    private comprasService: ComprasService,
    private comprasChequesService: ComprasChequesService,
    private ordenesPagoCompraService: OrdenesPagoCompraService,
    private operacionesVentasPropiasService: OperacionesVentasPropiasService,
    private operacionesComprasService: OperacionesComprasService
  ) { }

  // Inicio de componente
  ngOnInit(): void {
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {

        // Se obtiene la operacion mediante el operacionesService
        this.operacionesService.getOperacion(id).subscribe({
          next: ({ operacion, operacionVentasPropias, operacionCompras }) => {
            this.operacion = operacion;
            this.operacion.observacion = operacion.observacion ? operacion.observacion : '';
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

  // Regresar a la pagina anterior
  public regresar(): void {
    this.router.navigateByUrl('/dashboard/operaciones');
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('OPERACIONES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
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
      activo: true,
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
      activo: true,
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
      activo: true,
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
      activo: true,
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
    this.alertService.loading();
    this.operacionVentaPropiaSeleccionada = relacion;
    this.observacion = relacion.venta_propia.observacion;
    this.ventasPropiasProductosService.listarProductos({
      venta: this.operacionVentaPropiaSeleccionada.venta_propia._id
    }).subscribe({
      next: ({ productos }) => {

        this.showModalDetallesVenta = true;
        this.productosVenta = productos;

        // Se le agregan los precios de reguardo
        this.productosVenta.map(producto => {
          producto.precio_unitario_resguardo = producto.precio_unitario;
          producto.precio_total_resguardo = producto.precio_total;
        });

        // Se obtienen los cheques relacionados con la venta
        this.ventasPropiasChequesService.listarRelaciones({ venta_propia: this.operacionVentaPropiaSeleccionada.venta_propia._id }).subscribe({
          next: ({ relaciones }) => {
            this.cheques_venta = relaciones;

            // Se obtienen los recibos de cobro
            this.recibosCobroVentaService.listarRelaciones({ venta_propia: this.operacionVentaPropiaSeleccionada.venta_propia._id }).subscribe({
              next: ({ relaciones }) => {

                this.recibosCobro = relaciones;

                window.scroll(0, 0);
                this.calcularPagoTotal();
                this.showModalDetallesVenta = true;
                this.alertService.close();
              }, error: ({ error }) => this.alertService.errorApi(error.message)
            })

          },
          error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Abrir modal - Detalles compra
  public openModalDetallesCompra(relacion: any): void {

    this.operacionCompraSeleccionada = relacion;
    this.filtro.parametroProductosCompra = '';
    this.observacionCompra = this.operacionCompraSeleccionada.compra.observacion;

    const parametros = {
      direccion: -1,
      columna: 'descripcion',
      compra: this.operacionCompraSeleccionada.compra._id
    }

    this.alertService.loading();

    this.comprasProductosService.listarProductos(parametros).subscribe({
      next: ({ productos }) => {

        this.productosCompra = productos;

        // Se le agregan los precios de reguardo
        this.productosCompra.map(producto => {
          producto.precio_unitario_resguardo = producto.precio_unitario;
          producto.precio_total_resguardo = producto.precio_total;
        });

        // Se obtienen los cheques relacionados con la compra
        this.comprasChequesService.listarRelaciones({ compra: this.operacionCompraSeleccionada.compra._id }).subscribe({
          next: ({ relaciones }) => {

            this.cheques_compra = relaciones;

            // Se obtienen las ordenes de pago
            this.ordenesPagoCompraService.listarRelaciones({ compra: this.operacionCompraSeleccionada.compra._id }).subscribe({
              next: ({ relaciones }) => {
                this.ordenesPago = relaciones;
                this.calcularPagoTotalCompra();
                this.showModalDetallesCompra = true;
                this.alertService.close();
              }, error: ({ error }) => this.alertService.errorApi(error.message)
            })

          },
          error: ({ error }) => this.alertService.errorApi(error.message)
        })
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

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
        this.operacion.total_ventas += operacionVentaPropia.venta_propia.precio_total;
        this.operacion.saldo += operacionVentaPropia.venta_propia.precio_total;
        this.operacion.total += operacionVentaPropia.venta_propia.precio_total;
        this.showModalVincularVenta = false;
        this.alertService.close();
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
        this.operacion.total_compras += operacionCompra.compra.precio_total;
        this.operacion.saldo -= operacionCompra.compra.precio_total;
        this.operacion.total -= operacionCompra.compra.precio_total;
        this.showModalVincularCompra = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Eliminar OperacionVentaPropia
  eliminarOperacionVentaPropia(): void {
    this.alertService.loading();
    this.operacionesVentasPropiasService.eliminarOperacionVentaPropia(this.operacionVentaPropiaSeleccionada._id).subscribe({
      next: () => {
        this.operacionVentasPropias = this.operacionVentasPropias.filter(operacionVentaPropia => operacionVentaPropia._id !== this.operacionVentaPropiaSeleccionada._id);
        this.operacion.total_ventas -= this.operacionVentaPropiaSeleccionada.venta_propia.precio_total;
        this.operacion.saldo -= this.operacionVentaPropiaSeleccionada.venta_propia.precio_total;
        this.operacion.total -= this.operacionVentaPropiaSeleccionada.venta_propia.precio_total;
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
        this.operacion.total_compras -= this.operacionCompraSeleccionada.compra.precio_total;
        this.operacion.saldo += this.operacionCompraSeleccionada.compra.precio_total;
        this.operacion.total += this.operacionCompraSeleccionada.compra.precio_total;
        this.showModalDetallesCompra = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Navegar a nueva venta
  navegarNuevaVenta(): void {
    localStorage.setItem('operacion_id', JSON.stringify(this.operacion._id));
    localStorage.setItem('operacion_nro', JSON.stringify(this.operacion.numero));
    localStorage.setItem('venta_tipo_venta', '"Propia"');
    localStorage.setItem('venta_etapa', '"cliente"');
    localStorage.setItem('venta_clienteSeleccionado', JSON.stringify(null));
    localStorage.setItem('venta_productosVenta', JSON.stringify([]));
    this.router.navigateByUrl('/dashboard/nueva-venta');
  }

  // Navegar a nueva compra
  navegarNuevaCompra(): void {
    localStorage.setItem('operacion_id', JSON.stringify(this.operacion._id));
    localStorage.setItem('compra-productosCompra', JSON.stringify([]));
    localStorage.setItem('compra-proveedorSeleccionado', JSON.stringify(null));
    localStorage.setItem('operacion_nro', JSON.stringify(this.operacion.numero));
    this.router.navigateByUrl('/dashboard/nueva-compra');
  }

  // Completar operacion
  completarOperacion(): void {
    this.alertService.question({ msg: 'Completando operación', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.operacionesService.completarOperacion(this.operacion._id).subscribe({
            next: () => {
              this.operacion.estado = 'Completada';
              this.alertService.success('Operación completada correctamente');
            }, error: (error) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Reabrir operacion
  reabrirOperacion(): void {
    this.alertService.question({ msg: 'Abriendo operación', buttonText: 'Abrir' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.operacionesService.actualizarOperacion(this.operacion._id, { estado: 'Abierta' }).subscribe({
            next: () => {
              this.operacion.estado = 'Abierta';
              this.alertService.success('Operación abierta correctamente');
            }, error: (error) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Abrir detalles de cheque
  abrirDetallesCheque(cheque: any): void {
    this.chequeSeleccionado = cheque;
    this.showModalDetallesCompra = false;
    this.showDetallesCheque = true;
  }

  // Generar PDF - Venta
  generarPDF(venta: any): void {
    this.alertService.loading();
    this.ventasPropiasService.generarPDF({ venta: venta._id }).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/venta-propia.pdf`, '_blank');
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Generar PDF - Compra
  generarPDFCompra(compra: any): void {
    this.alertService.loading();
    this.comprasService.generarPDF({ compra: compra._id }).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/compra.pdf`, '_blank');
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Calculo de pago total
  calcularPagoTotal(): void {

    let pagoTotalTMP = 0;

    // Sumando montos de formas de pago
    this.operacionVentaPropiaSeleccionada.venta_propia.formas_pago.map(forma => {
      pagoTotalTMP += forma.monto;
    });

    // Sumando montos de cheques
    this.cheques_venta.map(relacion => {
      pagoTotalTMP += relacion.cheque.importe;
    });

    this.pagoTotal = pagoTotalTMP;

  }

  // Calculo de pago total
  calcularPagoTotalCompra(): void {

    let pagoTotalCompraTMP = 0;

    // Sumando montos de formas de pago
    this.operacionCompraSeleccionada.compra.formas_pago.map(forma => {
      pagoTotalCompraTMP += forma.monto;
    });

    // Sumando montos de cheques
    this.cheques_compra.map(relacion => {
      pagoTotalCompraTMP += relacion.cheque.importe;
    });

    this.pagoTotalCompra = pagoTotalCompraTMP;

  }

  // Actualizar observacion - Operacion
  actualizarObservacionOperacion(): void {
    this.alertService.loading();
    this.operacionesService.actualizarOperacion(this.operacion._id, { observacion: this.operacion.observacion }).subscribe({
      next: () => {
        this.operacion.observacion = this.operacion.observacion.toUpperCase();
        this.alertService.success('Observación actualizada correctamente');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar observacion - Venta
  actualizarObservacionVenta(): void {
    this.alertService.loading();
    const data = {
      observacion: this.observacion,
      updatorUser: this.authService.usuario.userId
    };
    this.ventasPropiasService.actualizarVenta(this.operacionVentaPropiaSeleccionada.venta_propia._id, data).subscribe({
      next: () => {
        this.observacionActualizadaFlag = true;
        this.operacionVentaPropiaSeleccionada.venta_propia.observacion = this.observacion;
        this.alertService.success('Observación actualizada correctamente');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Actualizar observacion - Compra
  actualizarObservacionCompra(): void {
    this.alertService.loading();
    const data = {
      observacion: this.observacionCompra,
      updatorUser: this.authService.usuario.userId
    };
    this.comprasService.actualizarCompra(this.operacionCompraSeleccionada.compra._id, data).subscribe({
      next: () => {
        this.operacionCompraSeleccionada.compra.observacion = this.observacionCompra;
        this.alertService.success('Observación actualizada correctamente');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  generarCompra(): void {

    this.alertService.loading();

    const parametros = {
      direccion: -1,
      columna: 'descripcion',
      venta: this.operacionVentaPropiaSeleccionada.venta_propia._id
    }

    this.ventasPropiasProductosService.listarProductos(parametros).subscribe({
      next: ({ productos }) => {

        let productosCompra = [];
        let precioTotal = 0;

        productos.map(producto => {
          productosCompra.push({
            cantidad: producto.cantidad,
            creatorUser: this.authService.usuario.userId,
            descripcion: producto.descripcion,
            familia: producto.familia,
            precio_original: producto.precio_unitario,
            precio_total: producto.precio_total,
            precio_unitario: producto.precio_unitario,
            producto: producto.producto._id,
            unidad_medida: producto.unidad_medida,
            updatorUser: this.authService.usuario.userId,
          })
          precioTotal += producto.precio_total;
        })

        // Adaptacion de localstorage

        localStorage.setItem('operacion_id', JSON.stringify(this.operacion._id));
        localStorage.setItem('operacion_nro', JSON.stringify(this.operacion.numero));
        localStorage.setItem('compra-productosCompra', JSON.stringify(productosCompra));
        localStorage.setItem('compra-porcentajesTotal', "");
        localStorage.setItem('compra-porcentajeAplicadoTotal', JSON.stringify(false));
        localStorage.setItem('compra-precio_total', JSON.stringify(precioTotal));
        localStorage.setItem('compra-proveedorSeleccionado', JSON.stringify(null));
        localStorage.setItem('compra-etapa', JSON.stringify("proveedores"));

        this.router.navigateByUrl('/dashboard/nueva-compra');

        this.alertService.close();

      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  generarVenta(): void {

    this.alertService.loading();

    const parametros = {
      direccion: -1,
      columna: 'descripcion',
      compra: this.operacionCompraSeleccionada.compra._id
    }

    this.comprasProductosService.listarProductos(parametros).subscribe({
      next: ({ productos }) => {

        let productosCompra = [];
        let precioTotalCompra = 0;

        productos.map(producto => {
          productosCompra.push({
            cantidad: producto.cantidad,
            creatorUser: this.authService.usuario.userId,
            descripcion: producto.producto.descripcion,
            familia: producto.producto.familia.descripcion,
            precio_original: producto.precio_unitario,
            precio_total: producto.precio_total,
            precio_unitario: producto.precio_unitario,
            producto: producto.producto._id,
            unidad_medida: producto.producto.unidad_medida.descripcion,
            updatorUser: this.authService.usuario.userId,
          })
          precioTotalCompra += producto.precio_total;
        })

        // Adaptacion de localstorage

        localStorage.setItem('operacion_id', JSON.stringify(this.operacion._id));
        localStorage.setItem('operacion_nro', JSON.stringify(this.operacion.numero));
        localStorage.setItem('venta_productosVenta', JSON.stringify(productosCompra));
        localStorage.setItem('venta_tipo_venta', JSON.stringify('Propia'));
        localStorage.setItem('venta_porcentajesTotal', "");
        localStorage.setItem('venta_porcentajeAplicadoTotal', JSON.stringify(false));
        localStorage.setItem('venta_precio_total', JSON.stringify(precioTotalCompra));
        localStorage.setItem('venta_clienteSeleccionado', JSON.stringify(null));
        localStorage.setItem('venta_etapa', JSON.stringify("cliente"));

        this.router.navigateByUrl('/dashboard/nueva-venta');

        this.alertService.close();

      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Imprimir detalles
  imprimirDetalles(): void {
    this.alertService.loading();
    this.operacionesService.imprimirDetalles(this.operacion._id).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/detalles-operacion.pdf`, '_blank');
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Cerrar detalles de cheque
  cerrarDetallesCheque(): void {
    this.showDetallesCheque = false;
    this.showModalDetallesCompra = true;
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

  // Paginacion de ventas propias - Cambiar pagina
  cambiarPaginaVentas(nroPagina): void {
    this.paginaActualVentas = nroPagina;
    this.desdeVentas = (this.paginaActualVentas - 1) * this.cantidadItemsVentas;
    this.alertService.loading();
    this.listarVentasPropias();
  }

  // Paginacion de compras - Cambiar pagina
  cambiarPaginaCompras(nroPagina): void {
    this.paginaActualCompras = nroPagina;
    this.desdeCompras = (this.paginaActualCompras - 1) * this.cantidadItemsCompras;
    this.alertService.loading();
    this.listarCompras();
  }

}
