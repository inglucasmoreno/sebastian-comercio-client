import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import gsap from 'gsap';
import { PresupuestosService } from 'src/app/services/presupuestos.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

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
  public productoCargado = false;

  // Formulario de cliente
  public clientesForm: any = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    direccion: '',
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
  public precio: number = null;

  // Paginacion - Clientes
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Paginacion - Productos
  public totalItems: number;
  public desde: number = 0;
  public paginaActualProductos: number = 1;
  public cantidadItemsProductos: number = 10;
  
  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    parametroProductos: ''
  }

  // Ordenar
  public ordenar = {
    direccion: 1,  // Asc (1) | Desc (-1)
    columna: 'descripcion'
  }

  constructor(private clientesService: ClientesService,
              private authService: AuthService,
              private presupuestosService: PresupuestosService,
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
    this.productosService.listarProductos({ parametro: this.filtro.parametroProductos, activo: true }).subscribe({
      next: ({ productos, totalItems }) => {
        this.totalItems = totalItems;
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
    this.filtro.parametroProductos = '';
    this.cantidadItemsProductos = 10;
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
    
    this.cantidad = null;
    this.productoSeleccionado = producto;
    
    // Se verifica si el producto ya esta cargado
    let cargado = false;
    let productoCargado: any;

    this.productosPresupuesto.map( productoMap => { 
      if(productoMap.producto === producto._id){
        cargado = true;
        productoCargado = productoMap;
      }
    });
    
    cargado ? this.precio = productoCargado.precio_unitario : this.precio = producto.precio;
    this.productoCargado = cargado;

  } 

  // Agregar producto al presupuesto
  agregarProducto(): void {

    const { _id, descripcion, unidad_medida } = this.productoSeleccionado;

    if(this.cantidad <= 0){
      this.alertService.info('Debes colocar una cantidad');
      return;
    }

    if(this.precio <= 0){
      this.alertService.info('Debes colocar un precio');
      return;
    }

    let repetido = false;

    // Se determina si el producto ya esta en la lista
    this.productosPresupuesto.map( producto => {
      if(producto.producto === this.productoSeleccionado._id){
        producto.cantidad = this.dataService.redondear(producto.cantidad + this.cantidad, 2);
        console.log(this.cantidad, this.precio);
        producto.precio_total = this.dataService.redondear(producto.cantidad * this.precio, 2);
        repetido = true;  
      }
    });

    // No esta repetido - Se agrega a la lista
    if(!repetido){              

      const data = {
        producto: _id,
        descripcion,
        familia: this.productoSeleccionado.familia.descripcion,
        unidad_medida: unidad_medida.descripcion,
        precio_unitario: this.precio,
        cantidad: this.cantidad,
        precio_total: this.dataService.redondear(this.precio * this.cantidad, 2),
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId
      }
  
      this.productosPresupuesto.unshift(data);

      this.filtro.parametroProductos = '';
      this.listarProductos();
    
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
      direccion: '',
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
    this.almacenamientoLocalStorage();
  }

  // Abrir clientes
  abrirModalClientes(): void {
    this.filtro.parametro = '';
    this.cantidadItems = 10;
    this.listarClientes();
  }

  // Crear presupuesto
  crearPresupuesto(): void {

    // Verificacion: Productos
    if(this.productosPresupuesto.length === 0){
      this.alertService.info('Debes cargar al menos un producto');
      return;
    }

    this.alertService.question({ msg: '¿Quieres generar el presupuesto?', buttonText: 'Generar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {

        this.alertService.loading();

        let dataCliente = '';

        // Adaptando cliente
        if(this.clienteSeleccionado && this.tipo_presupuesto !== 'consumidor_final'){
          dataCliente = this.clienteSeleccionado._id;
        }else if(!this.clienteSeleccionado && this.tipo_presupuesto !== 'consumidor_final'){
          dataCliente = '';
        }else if(this.tipo_presupuesto === 'consumidor_final'){
          dataCliente = '000000000000000000000000'
        }

        const data = {
          cliente: dataCliente,
          tipo_presupuesto: this.tipo_presupuesto,
          descripcion: this.tipo_presupuesto !== 'consumidor_final' ? this.clientesForm.descripcion : 'CONSUMIDOR FINAL',
          tipo_identificacion: this.tipo_presupuesto !== 'consumidor_final' ? this.clientesForm.tipo_identificacion : 'DNI',
          identificacion: this.tipo_presupuesto !== 'consumidor_final' ? this.clientesForm.identificacion : '',
          direccion: this.tipo_presupuesto !== 'consumidor_final' ? this.clientesForm.direccion : '',
          telefono: this.tipo_presupuesto !== 'consumidor_final' ? this.clientesForm.telefono : '',
          correo_electronico: this.tipo_presupuesto !== 'consumidor_final' ? this.clientesForm.correo_electronico : '',
          precio_total: this.precio_total,
          productos: this.productosPresupuesto,
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId,
        };

        this.presupuestosService.nuevoPresupuesto(data).subscribe({
          next: () => {
            this.reiniciarValores();
            this.alertService.success('Presupuesto generado correctamente');
            window.open(`${base_url}/pdf/presupuesto.pdf`, '_blank');   
          },
          error: ({error}) => this.alertService.errorApi(error.message)
        });

      }
    });    
  }

  reiniciarValores(): void {

    // Clientes
    this.clientes = [];
    this.clienteSeleccionado = null;

    // Tipo de presupuesto
    this.tipo_presupuesto = 'consumidor_final';

    // Flags
    this.etapa = 'tipo_presupuesto';
    this.productoCargado = false;

    // Formulario de cliente
    this.clientesForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      direccion: '',
      telefono: '',
      correo_electronico: ''
    }

    // Presupuesto
    this.precio_total = 0;

    // Productos
    this.productos = [];
    this.productosPresupuesto = [];
    this.productoSeleccionado = null;
    this.cantidad = null;
    this.precio = null;

    // Filtrado
    this.filtro = {
      activo: 'true',
      parametro: '',
      parametroProductos: ''
    }

    // Ordenar
    this.ordenar = {
      direccion: 1,  // Asc (1) | Desc (-1)
      columna: 'descripcion'
    }

    this.almacenamientoLocalStorage();

  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void{
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(): void{
    this.paginaActual = 1;
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
    localStorage.setItem('productoCargado', JSON.stringify(this.productoCargado));
    localStorage.setItem('tipo_presupuesto', JSON.stringify(this.tipo_presupuesto));
    localStorage.setItem('clienteSeleccionado', JSON.stringify(this.clienteSeleccionado));
    localStorage.setItem('clientesForm', JSON.stringify(this.clientesForm));
    localStorage.setItem('productosPresupuesto', JSON.stringify(this.productosPresupuesto));
    localStorage.setItem('precio_total', JSON.stringify(this.precio_total));
  }

  // recupearar localstorage
  recuperarLocalStorage(): void {
    this.etapa = localStorage.getItem('etapa') ? JSON.parse(localStorage.getItem('etapa')) : 'tipo_presupuesto';
    this.productoCargado = localStorage.getItem('productoCargado') ? JSON.parse(localStorage.getItem('productoCargado')) : false;
    this.clienteSeleccionado = localStorage.getItem('clienteSeleccionado') ? JSON.parse(localStorage.getItem('clienteSeleccionado')) : null;  
    this.tipo_presupuesto = localStorage.getItem('tipo_presupuesto') ? JSON.parse(localStorage.getItem('tipo_presupuesto')) : 'consumidor_final';  
    this.clientesForm = localStorage.getItem('clientesForm') ? JSON.parse(localStorage.getItem('clientesForm')) : {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      direccion: '',
      telefono: '',
      correo_electronico: ''     
    };
    this.productosPresupuesto = localStorage.getItem('productosPresupuesto') ? JSON.parse(localStorage.getItem('productosPresupuesto')) : [];
    this.precio_total = localStorage.getItem('precio_total') ? JSON.parse(localStorage.getItem('precio_total')) : [];
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActualProductos = nroPagina;
    this.desde = (this.paginaActualProductos - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarProductos();
  }

}
