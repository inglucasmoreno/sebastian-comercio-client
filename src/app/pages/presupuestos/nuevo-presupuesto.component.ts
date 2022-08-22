import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import gsap from 'gsap';

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
  public etapa = 'tipo_presupuesto';
  public guardar_cliente = false;

  // Formulario de cliente
  public clientesForm: any = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    telefono: '',
    correo_electronico: ''
  }

  // Presupuesto
  public precio_total = 0;

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
              private authService: AuthService,
              private productosService: ProductosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Nuevo presupuesto';
    this.recuperarLocalStorage();
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
    this.almacenamientoLocalStorage();
  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
  } 

  // Agregar producto al presupuesto
  agregarProducto(): void {

    const { _id, descripcion, unidad_medida, precio } = this.productoSeleccionado;

    let repetido = false;

    // Se determina si el producto ya esta en la lista
    this.productosPresupuesto.map( producto => {
      if(producto.producto === this.productoSeleccionado._id){
        producto.cantidad = this.dataService.redondear(producto.cantidad + this.cantidad, 2);
        producto.precio_total = this.dataService.redondear(producto.cantidad * producto.precio_unitario, 2);
        repetido = true;  
      }
    });

    // No esta repetido - Se agrega a la lista
    if(!repetido){              

      const data = {
        producto: _id,
        descripcion,
        unidad_medida: unidad_medida.descripcion,
        precio_unitario: precio,
        cantidad: this.cantidad,
        precio_total: this.dataService.redondear(precio * this.cantidad, 2),
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId
      }
  
      this.productosPresupuesto.unshift(data);
    
    }

    this.productoSeleccionado = null;
    this.cantidad = null;

    this.calcularPrecio();
  
  }

  // Eliminar producto de presupuesto
  eliminarProductoDePresupuesto(producto: any): void {
    this.alertService.question({ msg: '¿Quieres eliminar el producto?', buttonText: 'Eliminar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.productosPresupuesto = this.productosPresupuesto.filter( elemento => elemento.producto !== producto.producto);
        this.calcularPrecio();
      }
    });
  }

  // Eliminar cliente seleccionado
  eliminarClienteSeleccionado(): void {
    this.clienteSeleccionado = null;
    this.clientesForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      telefono: '',
      correo_electronico: ''
    }
    this.almacenamientoLocalStorage();
  }

  // Eliminar producto seleccionado
  eliminarProducto(): void {
    this.productoSeleccionado = null;
  }

  // Calcular precio
  calcularPrecio(): void {
    let precioTMP = 0;
    this.productosPresupuesto.map( producto => {
      precioTMP += producto.precio_total
    });
    this.precio_total = precioTMP;
    this.almacenamientoLocalStorage();
  }

  // Regresar a etapa anterior
  regresar(etapaActual: string): void {
    if(etapaActual === 'clientes') this.etapa = 'tipo_presupuesto';
    if(etapaActual === 'productos' && this.tipo_presupuesto === 'cliente') this.etapa = 'cliente';
    if(etapaActual === 'productos' && this.tipo_presupuesto === 'consumidor_final') this.etapa = 'tipo_presupuesto';
    this.almacenamientoLocalStorage();
  }

  // Seleccionando tipo de presupuesto
  seleccionarTipoPresupuesto(): void {
    if(this.tipo_presupuesto === 'consumidor_final') this.etapa = 'productos';
    if(this.tipo_presupuesto === 'cliente') this.etapa = 'cliente';
    this.almacenamientoLocalStorage();
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

  // Crear presupuesto
  crearPresupuesto(): void {
    this.alertService.question({ msg: '¿Quieres generar el presupuesto?', buttonText: 'Generar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        console.log('Generando presupuesto');
      }
    });    
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

  // Alamcenamiento en localstorage
  almacenamientoLocalStorage(): void {
    localStorage.setItem('etapa', JSON.stringify(this.etapa));
    localStorage.setItem('tipo_presupuesto', JSON.stringify(this.tipo_presupuesto));
    localStorage.setItem('clienteSeleccionado', JSON.stringify(this.clienteSeleccionado));
    localStorage.setItem('clientesForm', JSON.stringify(this.clientesForm));
    localStorage.setItem('productosPresupuesto', JSON.stringify(this.productosPresupuesto));
    localStorage.setItem('precio_total', JSON.stringify(this.precio_total));
  }

  // recupearar localstorage
  recuperarLocalStorage(): void {
    this.etapa = localStorage.getItem('etapa') ? JSON.parse(localStorage.getItem('etapa')) : 'tipo_presupuesto';
    this.clienteSeleccionado = localStorage.getItem('clienteSeleccionado') ? JSON.parse(localStorage.getItem('clienteSeleccionado')) : null;  
    this.tipo_presupuesto = localStorage.getItem('tipo_presupuesto') ? JSON.parse(localStorage.getItem('tipo_presupuesto')) : 'consumido_final';  
    this.clientesForm = localStorage.getItem('clientesForm') ? JSON.parse(localStorage.getItem('clientesForm')) : {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      telefono: '',
      correo_electronico: ''     
    };
    this.productosPresupuesto = localStorage.getItem('productosPresupuesto') ? JSON.parse(localStorage.getItem('productosPresupuesto')) : [];
    this.precio_total = localStorage.getItem('precio_total') ? JSON.parse(localStorage.getItem('precio_total')) : [];
  }

}
