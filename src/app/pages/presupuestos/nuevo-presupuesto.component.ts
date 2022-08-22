import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';

@Component({
  selector: 'app-nuevo-presupuesto',
  templateUrl: './nuevo-presupuesto.component.html',
  styles: [
  ]
})
export class NuevoPresupuestoComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showClientes = false;
  public showProductos = false;

  // Clientes
  public clientes: any[] = [];
  public clienteSeleccionado: any = null;

  // Tipo de presupuesto
  public tipo_presupuesto = 'consumidor_final';

  // Flags
  public etapa = 'productos';
  public guardar_cliente = false;

  // Formulario de cliente
  public clientesForm: any = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    correo_electronico: ''
  }

  // Productos
  public productos: any[] = [];
  public productosPresupuesto: any[] = [];
  public productoSeleccionado: any = null;
  public cantidad: number = null;

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private clientesService: ClientesService,
              private productosService: ProductosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Nuevo presupuesto';
  }

  // Listar clientes
  listarClientes(): void {
    this.alertService.loading();
    this.clientesService.listarClientes({
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna
    }).subscribe({
      next: ({ clientes }) => {
        this.clientes = clientes;
        this.alertService.close();
        this.showClientes = true;
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Listar productos
  listarProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({productos}) => {
        this.productos = productos;
        this.alertService.close();
        this.showProductos = true;
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  buscarProductos(): void {
    this.productoSeleccionado = null;
    this.cantidad = null;
    this.listarProductos();   
  }

  // Seleccionar cliente
  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.clientesForm = cliente;
    this.showClientes = false;
  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
  } 

  // Agregar producto
  agregarProducto(): void {
    this.productosPresupuesto.unshift(
      {...this.productoSeleccionado, 
        cantidad: this.cantidad, 
        precio_total: this.cantidad * this.productoSeleccionado.precio
      });
    this.productoSeleccionado = null;
    this.cantidad = null;
  }

  // Eliminar cliente
  eliminarClienteSeleccionado(): void {
    this.clienteSeleccionado = null;
    this.clientesForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      telefono: '',
      correo_electronico: ''
    }
  }

  // Eliminar producto
  eliminarProducto(): void {
    this.productoSeleccionado = null;
  }

  // Regresar a etapa anterior
  regresar(etapaActual: string): void {
    if(etapaActual === 'clientes') this.etapa = 'tipo_presupuesto';
    if(etapaActual === 'productos') this.etapa = 'cliente';
  }

  // Seleccionando tipo de presupuesto
  seleccionarTipoPresupuesto(): void {
    if(this.tipo_presupuesto === 'consumidor_final') this.etapa = 'productos';
    if(this.tipo_presupuesto === 'cliente') this.etapa = 'cliente';
  }

  // Seleccionar cliente
  seleccionarClientePresupuesto(): void {
    const { descripcion, identificacion } = this.clientesForm;
    if(descripcion === '' || identificacion === ''){
      this.alertService.info('Debe completar los campos obligatorios');
      return;
    }
    this.etapa = 'productos';
  }

  // Abrir clientes
  abrirModalClientes(): void {
    this.listarClientes();
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
    this.listarClientes();
  }

}
