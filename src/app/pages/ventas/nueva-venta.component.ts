import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ProveedoresService } from 'src/app/services/proveedores.service';
import { VentasService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';
import gsap from 'gsap';

const base_url = environment.base_url;

@Component({
  selector: 'app-nueva-venta',
  templateUrl: './nueva-venta.component.html',
  styles: [
  ]
})
export class NuevaVentaComponent implements OnInit {

 // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showClientes = false;
  public showProductos = false;
  public showEditarProducto = false;

  // Clientes
  public clientes: any[] = [];
  public clienteSeleccionado: any = null;

  // Proveedores
  public proveedores: any[] = [];

  // Tipo de venta
  public tipo_venta = 'Directa';
  public tipo_cliente = 'consumidor_final';

  // Flags
  public etapa = 'tipo_venta';
  public productoCargado = false;

  // Formulario de cliente
  public clientesForm: any = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    direccion: '',
    telefono: '',
    correo_electronico: '',
    condicion_iva: 'Consumidor Final'
  }

  // Venta
  public nro_factura = '';
  public proveedor = '';
  public precio_total = 0;
  public observacion:string = '';

  // Productos
  public productos: any[] = [];
  public productosVenta: any[] = [];
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
              private proveedoresService: ProveedoresService,
              private ventasService: VentasService,
              private productosService: ProductosService,
              private alertService: AlertService,
              private dataService: DataService) { }

  // Inicio del componente
  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Nueva venta';
    this.recuperarLocalStorage();
    this.alertService.loading();
    this.proveedoresService.listarProveedores().subscribe({
      next: ({ proveedores }) => {
        this.proveedores = proveedores;
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    });
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
    this.productosService.listarProductos({ 
      desde: this.desde,
      cantidadItems: this.cantidadItems,
      parametro: this.filtro.parametroProductos, 
      activo: true }).subscribe({
      next: ({ productos, totalItems }) => {
        this.totalItems = totalItems;
        this.productos = productos;
        this.alertService.close();
        this.showProductos = true;
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Buscar productos
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

    this.productosVenta.map( productoMap => { 
      if(productoMap.producto === producto._id){
        cargado = true;
        productoCargado = productoMap;
      }
    });
    
    cargado ? this.precio = productoCargado.precio_unitario : this.precio = producto.precio;
    this.productoCargado = cargado;

  } 

  // Agregar producto a la venta
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
    this.productosVenta.map( producto => {
      if(producto.producto === this.productoSeleccionado._id){
        producto.cantidad = this.dataService.redondear(producto.cantidad + this.cantidad, 2);
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
  
      this.productosVenta.unshift(data);

      this.filtro.parametroProductos = '';
      this.listarProductos();
    
    }

    this.productoSeleccionado = null;
    this.cantidad = null;

    this.calcularPrecio();
  
  }

  // Actualizar producto
  actualizarProducto(): void {

    const { descripcion, unidad_medida } = this.productoSeleccionado;

    if(this.cantidad <= 0){
      this.alertService.info('Debes colocar una cantidad');
      return;
    }

    if(this.precio <= 0){
      this.alertService.info('Debes colocar un precio');
      return;
    }

    this.productosVenta.map((producto)=>{
      if(producto.producto  === this.productoSeleccionado.producto){
        producto.cantidad = this.cantidad;
        producto.precio_unitario = this.precio;
        producto.precio_total = this.dataService.redondear(this.cantidad * this.precio, 2);
      }
    });

    this.showEditarProducto = false;
    this.calcularPrecio();
  
  }

  // Eliminar producto de la venta
  eliminarProductoDeVenta(): void {
    this.alertService.question({ msg: '¿Quieres eliminar el producto?', buttonText: 'Eliminar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.productosVenta = this.productosVenta.filter( elemento => elemento.producto !== this.productoSeleccionado.producto);
        this.showEditarProducto = false;
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
      correo_electronico: '',
      condicion_iva: 'Consumidor Final'
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
    this.productosVenta.map( producto => {
      precioTMP += producto.precio_total
    });
    this.precio_total = precioTMP;
    this.almacenamientoLocalStorage();
  } 

  // Regresar a etapa anterior
  regresar(etapaActual: string): void {
    if(etapaActual === 'clientes') this.etapa = 'tipo_venta';
    if(etapaActual === 'productos' && this.tipo_cliente === 'cliente') this.etapa = 'cliente';
    if(etapaActual === 'productos' && this.tipo_cliente === 'consumidor_final') this.etapa = 'tipo_venta';
    this.almacenamientoLocalStorage();
  }

  // Seleccionando tipo de cliente
  seleccionarTipoCliente(): void {
    if(this.tipo_cliente === 'consumidor_final') this.etapa = 'productos';
    if(this.tipo_cliente === 'cliente') this.etapa = 'cliente';
    this.almacenamientoLocalStorage();
  }

  // Seleccionar cliente
  seleccionarClienteVenta(): void {
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

  // Crear venta
  crearVenta(): void {

    // Verificacion: Proveedor
    if(this.proveedor === ''){
      this.alertService.info('Debes seleccionar un proveedor');
      return;
    }

    // Verificacion: Número de factura
    if(this.nro_factura === ''){
      this.alertService.info('Debes colocar un numero de factura');
      return;
    }

    // Verificacion: Productos
    if(this.productosVenta.length === 0){
      this.alertService.info('Debes cargar al menos un producto');
      return;
    }

    this.alertService.question({ msg: '¿Quieres generar la venta?', buttonText: 'Generar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {

        this.alertService.loading();

        let dataCliente = '';

        // Adaptando cliente
        if(this.clienteSeleccionado && this.tipo_cliente !== 'consumidor_final'){
          dataCliente = this.clienteSeleccionado._id;
        }else if(!this.clienteSeleccionado && this.tipo_cliente !== 'consumidor_final'){
          dataCliente = '';
        }else if(this.tipo_cliente === 'consumidor_final'){
          dataCliente = '000000000000000000000000'
        }

        const data = {
          cliente: dataCliente,
          nro_factura: this.nro_factura,
          tipo_cliente: this.tipo_cliente,
          tipo_venta: this.tipo_venta,
          cliente_descripcion: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.descripcion : 'CONSUMIDOR FINAL',
          observacion: this.observacion,
          cliente_tipo_identificacion: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.tipo_identificacion : 'DNI',
          cliente_identificacion: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.identificacion : '',
          cliente_direccion: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.direccion : '',
          cliente_telefono: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.telefono : '',
          cliente_correo_electronico: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.correo_electronico : '',
          cliente_condicion_iva: this.tipo_cliente !== 'consumidor_final' ? this.clientesForm.condicion_iva : 'Consumidor Final',
          precio_total: this.precio_total,
          productos: this.productosVenta,
          proveedor: this.proveedor,
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId,
        };

        console.log(data);

        this.ventasService.nuevaVenta(data).subscribe({
          next: () => {
            this.reiniciarValores();
            this.alertService.success('Venta generada correctamente');
            window.open(`${base_url}/pdf/venta.pdf`, '_blank');   
          },
          error: ({error}) => this.alertService.errorApi(error.message)
        });

      }
    });    
  }

  // Editar producto
  abrirEditarProducto(producto): void {
    this.productoSeleccionado = producto;
    this.showEditarProducto = true;
    this.productoCargado = false;
    this.cantidad = producto.cantidad;
    this.precio = producto.precio_unitario;
  }

  // Reiniciar valores
  reiniciarValores(): void {

    // Clientes
    this.clientes = [];
    this.clienteSeleccionado = null;

    // Tipo de cliente
    this.tipo_cliente = 'consumidor_final';

    // Flags
    this.etapa = 'tipo_venta';
    this.productoCargado = false;

    // Formulario de cliente
    this.clientesForm = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      direccion: '',
      telefono: '',
      correo_electronico: '',
      condicion_iva: 'Consumidor Final'
    }

    // Venta
    this.precio_total = 0;
    this.observacion = '';
    this.nro_factura = '';
    this.proveedor = '';

    // Productos
    this.productos = [];
    this.productosVenta = [];
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
    localStorage.setItem('venta_etapa', JSON.stringify(this.etapa));
    localStorage.setItem('venta_productoCargado', JSON.stringify(this.productoCargado));
    localStorage.setItem('venta_tipo_cliente', JSON.stringify(this.tipo_cliente));
    localStorage.setItem('venta_tipo_venta', JSON.stringify(this.tipo_venta));
    localStorage.setItem('venta_clienteSeleccionado', JSON.stringify(this.clienteSeleccionado));
    localStorage.setItem('venta_clientesForm', JSON.stringify(this.clientesForm));
    localStorage.setItem('venta_productosVenta', JSON.stringify(this.productosVenta));
    localStorage.setItem('venta_precio_total', JSON.stringify(this.precio_total));
    localStorage.setItem('venta_observacion', JSON.stringify(this.observacion));
  }

  // recupearar localstorage
  recuperarLocalStorage(): void {
    this.etapa = localStorage.getItem('venta_etapa') ? JSON.parse(localStorage.getItem('venta_etapa')) : 'tipo_venta';
    this.productoCargado = localStorage.getItem('venta_productoCargado') ? JSON.parse(localStorage.getItem('venta_productoCargado')) : false;
    this.clienteSeleccionado = localStorage.getItem('venta_clienteSeleccionado') ? JSON.parse(localStorage.getItem('venta_clienteSeleccionado')) : null;  
    this.tipo_cliente = localStorage.getItem('venta_tipo_cliente') ? JSON.parse(localStorage.getItem('venta_tipo_cliente')) : 'consumidor_final';
    this.tipo_venta = localStorage.getItem('venta_tipo_venta') ? JSON.parse(localStorage.getItem('venta_tipo_venta')) : 'Directa';  
    this.clientesForm = localStorage.getItem('venta_clientesForm') ? JSON.parse(localStorage.getItem('venta_clientesForm')) : {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      direccion: '',
      telefono: '',
      correo_electronico: '',
      condicion_iva: 'Consumidor Final'
    };
    this.productosVenta = localStorage.getItem('venta_productosVenta') ? JSON.parse(localStorage.getItem('venta_productosVenta')) : [];
    this.precio_total = localStorage.getItem('venta_precio_total') ? JSON.parse(localStorage.getItem('venta_precio_total')) : [];
    this.observacion = localStorage.getItem('venta_observacion') ? JSON.parse(localStorage.getItem('venta_observacion')) : '';
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActualProductos = nroPagina;
    this.desde = (this.paginaActualProductos - 1) * this.cantidadItemsProductos;
    this.alertService.loading();
    this.listarProductos();
  }

}
