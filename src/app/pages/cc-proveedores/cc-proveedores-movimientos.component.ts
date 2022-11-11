import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CcProveedoresMovimientosService } from 'src/app/services/cc-proveedores-movimientos.service';
import { CcProveedoresService } from 'src/app/services/cc-proveedores.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-cc-proveedores-movimientos',
  templateUrl: './cc-proveedores-movimientos.component.html',
  styles: [
  ]
})
export class CcProveedoresMovimientosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalMovimiento = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Cuenta corriente
  public idCuentaCorriente: string = '';
  public cuentaCorriente: any;

  // Movimiento
  public idMovimiento: string = '';
  public movimientos: any = [];
  public movimientoSeleccionado: any;

  // Data
  public descripcion: string = '';
  public tipo: string = 'Debe';
  public monto: number = null;

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;
  public desde: number = 0;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(
    private movimientosService: CcProveedoresMovimientosService,
    private activatedRoute: ActivatedRoute,
    private cuentaCorrienteService: CcProveedoresService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Cuenta corriente - Registros';
    this.activatedRoute.params.subscribe(({ id }) => { this.idCuentaCorriente = id; });
    this.permisos.all = this.permisosUsuarioLogin();
    this.calculosIniciales();
  }

  // Calculos iniciales
  calculosIniciales(): void {
    this.alertService.loading();
    this.cuentaCorrienteService.getCuentaCorriente(this.idCuentaCorriente).subscribe({
      next: ({ cuenta_corriente }) => {
        this.cuentaCorriente = cuenta_corriente;
        this.listarMovimientos();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('TESORERIA_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, movimiento: any = null): void {
    window.scrollTo(0, 0);
    this.descripcion = '';
    this.tipo = 'Debe';
    this.monto = null;
    this.idMovimiento = '';

    if (estado === 'editar') this.getMovimiento(movimiento);
    else this.showModalMovimiento = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de movimiento
  getMovimiento(movimiento: any): void {
    this.alertService.loading();
    this.idMovimiento = movimiento._id;
    this.movimientoSeleccionado = movimiento;
    this.movimientosService.getMovimiento(movimiento._id).subscribe(({ movimiento }) => {
      this.descripcion = movimiento.descripcion;
      this.alertService.close();
      this.showModalMovimiento = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar movimientos
  listarMovimientos(): void {
    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      cc_proveedor: this.idCuentaCorriente
    }
    this.movimientosService.listarMovimientos(parametros)
      .subscribe(({ movimientos, totalItems }) => {
        this.movimientos = movimientos;
        this.totalItems = totalItems;
        this.showModalMovimiento = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo movimiento
  nuevoMovimiento(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    // Verificacion: monto invalido
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar un monto válido');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      cc_proveedor: this.cuentaCorriente._id,
      proveedor: this.cuentaCorriente.proveedor._id,
      monto: this.monto,
      tipo: this.tipo,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.movimientosService.nuevoMovimiento(data).subscribe(({ saldo_nuevo }) => {
      this.cuentaCorriente.saldo = saldo_nuevo;
      this.listarMovimientos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar movimiento
  actualizarMovimiento(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      updatorUser: this.authService.usuario.userId,
    }

    this.movimientosService.actualizarMovimiento(this.idMovimiento, data).subscribe(() => {
      this.listarMovimientos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(movimiento: any): void {

    const { _id, activo } = movimiento;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.movimientosService.actualizarMovimiento(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarMovimientos();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

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
    this.listarMovimientos();
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
    this.listarMovimientos();
  }

}
