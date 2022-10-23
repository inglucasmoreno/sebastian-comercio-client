import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CajasMovimientosService } from 'src/app/services/cajas-movimientos.service';
import { CajasService } from 'src/app/services/cajas.service';
import { DataService } from 'src/app/services/data.service';
import { VentasPropiasChequesService } from 'src/app/services/ventas-propias-cheques.service';
import { VentasPropiasProductosService } from 'src/app/services/ventas-propias-productos.service';
import { VentasPropiasService } from 'src/app/services/ventas-propias.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-cajas-movimientos',
  templateUrl: './cajas-movimientos.component.html',
  styles: [
  ]
})
export class CajasMovimientosComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalMovimiento = false;
  public showModalDetalles = false;
  public showModalDetallesVenta = false;
  public showModalDetallesCheque = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Caja
  public idCaja: string = '';
  public caja: any;

  // Movimiento
  public idMovimiento: string = '';
  public movimientos: any = [];
  public movimientoSeleccionado: any;

  // Data
  public descripcion: string = '';
  public tipo: string = 'Debe';
  public monto: number = null;

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Venta propia
  public ventaPropia: any;
  public productos: any[];
  public relaciones: any[];  // Relaciones venta_propia = cheques
  public chequeSeleccionado: any;

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
             private movimientosService: CajasMovimientosService,
             private ventasPropiasService: VentasPropiasService,
             private ventasPropiasChequesService: VentasPropiasChequesService,
             private ventasPropiasProductosService: VentasPropiasProductosService,
             private activatedRoute: ActivatedRoute,
             private cajasService: CajasService,
             private authService: AuthService,
             private alertService: AlertService,
             private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Cajas - Registros';
    this.activatedRoute.params.subscribe(({id}) => { this.idCaja = id; });
    this.permisos.all = this.permisosUsuarioLogin();
    this.calculosIniciales(); 
  }

  // Calculos iniciales
  calculosIniciales(): void {
    this.alertService.loading();
    this.cajasService.getCaja(this.idCaja).subscribe({
      next: ({caja}) => {
        this.caja = caja;
        this.listarMovimientos();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('CAJAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, movimiento: any = null): void {
    window.scrollTo(0,0);
    this.descripcion = '';
    this.tipo = 'Debe';
    this.monto = null;
    this.idMovimiento = '';
    
    if(estado === 'editar') this.getMovimiento(movimiento);
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
    },({error})=>{
      this.alertService.errorApi(error);
    });
  }

  // Listar movimientos
  listarMovimientos(): void {
    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      caja: this.idCaja
    }
    this.movimientosService.listarMovimientos(parametros)
    .subscribe( ({ movimientos }) => {
      this.movimientos = movimientos;
      this.showModalMovimiento = false;
      this.alertService.close();
    }, (({error}) => {
      this.alertService.errorApi(error.msg);
    }));
  }

  // Nuevo movimiento
  nuevoMovimiento(): void {

  // Verificacion: Descripción vacia
  if(this.descripcion.trim() === ""){
    this.alertService.info('Debes colocar una descripción');
    return;
  }

  // Verificacion: monto invalido
  if(this.descripcion.trim() === ""){
    this.alertService.info('Debes colocar un monto válido');
    return;
  }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      caja: this.caja._id,
      monto: this.monto,
      tipo: this.tipo,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.movimientosService.nuevoMovimiento(data).subscribe(({ saldo_nuevo }) => {
      this.caja.saldo = saldo_nuevo;
      this.listarMovimientos();
    },({error})=>{
      this.alertService.errorApi(error.message);  
    });
    
  }

  // Actualizar movimiento
  actualizarMovimiento(): void {

    // Verificacion: Descripción vacia
    if(this.descripcion.trim() === ""){
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
    },({error})=>{
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(movimiento: any): void {
    
    const { _id, activo } = movimiento;
    
    if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.movimientosService.actualizarMovimiento(_id, {activo: !activo}).subscribe(() => {
              this.alertService.loading();
              this.listarMovimientos();
            }, ({error}) => {
              this.alertService.close();
              this.alertService.errorApi(error.message);
            });
          }
        });

  }

  // Abrir modal - Detalles de movimientos
  abrirDetallesMovimientos(movimiento: any): void { 
    if(movimiento.venta_propia !== ''){
      this.alertService.loading();
      this.ventasPropiasService.getVenta(movimiento.venta_propia).subscribe({
        next: ({venta}) => {
          this.ventaPropia = venta;
          console.log(this.ventaPropia);

          this.ventasPropiasProductosService.listarProductos({venta: venta._id}).subscribe({
            next: ({productos}) => {
              this.productos = productos;
              console.log(this.productos);
          
              this.ventasPropiasChequesService.listarRelaciones({venta_propia: venta._id}).subscribe({
                next: ({relaciones}) => {

                  this.relaciones = relaciones;
                  console.log(this.relaciones);

                  this.movimientoSeleccionado = movimiento;
                  this.showModalDetalles = true;

                  this.alertService.close();

                }, error: ({error}) => this.alertService.errorApi(error.message)
              })            
            
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })

        }, error: ({error}) => this.alertService.errorApi(error.message)
      })
    }else{
      this.movimientoSeleccionado = movimiento;
      this.showModalDetalles = true;
    }
  }

  // Generar PDF
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
  
  // Abrir detalles de venta
  abrirDetallesVenta(): void {
    this.showModalDetalles = false;
    this.showModalDetallesVenta = true;
  }

  // Cerrar detalles de venta
  cerrarDetallesVenta(): void {
    this.showModalDetallesVenta = false;
    this.showModalDetalles = true;
  }

  // Abrir detalles de cheque
  abrirDetallesCheque(cheque: any): void {
    this.chequeSeleccionado = cheque;
    this.showModalDetallesVenta = false;
    this.showModalDetallesCheque = true;
  }

  // Cerrar el detalles del cheque
  cerrarDetallesCheque(): void {
    this.showModalDetallesCheque = false;
    this.showModalDetallesVenta = true;
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void{
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.listarMovimientos();
  }

}
