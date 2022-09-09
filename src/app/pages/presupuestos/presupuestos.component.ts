import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PresupuestoProductosService } from 'src/app/services/presupuesto-productos.service';
import { PresupuestosService } from 'src/app/services/presupuestos.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-presupuestos',
  templateUrl: './presupuestos.component.html',
  styles: [
  ]
})
export class PresupuestosComponent implements OnInit {

 // Permisos de usuarios login
 public permisos = { all: false };

 // Modal
 public showModalPresupuesto = false;
 public showModalEditarPresupuesto = false;

 // Presupuesto
 public idPresupuesto: string = '';
 public observacion: string = '';
 public presupuestos: any = [];
 public presupuestoSeleccionado: any;
 public descripcion: string = '';
 
 // Productos
 public productos: any[];
 public productoSeleccionado: any;
 public cantidad = null;
 public precio_unitario = null;
 public precio_total = null;

 // Paginacion
 public paginaActual: number = 1;
 public cantidadItems: number = 10;

 // Estado login
 public observacionActualizadaFlag: boolean = false;

 // Filtrado
 public filtro = {
   activo: 'true',
   parametro: '',
   parametroProductos: ''
 }

 // Ordenar
 public ordenar = {
   direccion: -1,  // Asc (1) | Desc (-1)
   columna: 'createdAt'
 }

 constructor(private presupuestosService: PresupuestosService,
             private presupuestoProductosService: PresupuestoProductosService,
             private authService: AuthService,
             private alertService: AlertService,
             private dataService: DataService) { }

   ngOnInit(): void {
     this.dataService.ubicacionActual = 'Dashboard - Listado de presupuestos'; 
     this.permisos.all = this.permisosUsuarioLogin();
     this.alertService.loading();
     this.listarPresupuestos(); 
   }

   // Asignar permisos de usuario login
   permisosUsuarioLogin(): boolean {
     return this.authService.usuario.permisos.includes('PRESUPUESTOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
   }

   // Traer datos de presupuesto
   getPresupuesto(presupuesto: any): void {
     this.alertService.loading();
     this.idPresupuesto = presupuesto._id;
     this.presupuestoSeleccionado = presupuesto;
     this.presupuestosService.getPresupuesto(presupuesto._id).subscribe(({presupuesto}) => {
       this.descripcion = presupuesto.descripcion;
       this.alertService.close();
       this.showModalPresupuesto = true;
     },({error})=>{
       this.alertService.errorApi(error);
     });
   }

   // Listar presupuestos
   listarPresupuestos(): void {
     const parametros = {
       direccion: this.ordenar.direccion,
       columna: this.ordenar.columna
     }
     this.presupuestosService.listarPresupuestos(parametros)
     .subscribe( ({ presupuestos }) => {
       this.presupuestos = presupuestos;
       this.showModalPresupuesto = false;
       this.productoSeleccionado = null;
       if(this.observacionActualizadaFlag){
         this.alertService.success('Observación actualizada');
         this.observacionActualizadaFlag = false;
       }else this.alertService.close();
     }, (({error}) => {
       this.alertService.errorApi(error.msg);
     }));
   }

   // Nuevo presupuesto
   nuevoPresupuesto(): void {

     // Verificacion: Descripción vacia
     if(this.descripcion.trim() === ""){
       this.alertService.info('Debes colocar una descripción');
       return;
     }

     this.alertService.loading();

     const data = {
       descripcion: this.descripcion,
       creatorUser: this.authService.usuario.userId,
       updatorUser: this.authService.usuario.userId,
     }

     this.presupuestosService.nuevoPresupuesto(data).subscribe(() => {
       this.listarPresupuestos();
     },({error})=>{
       this.alertService.errorApi(error.message);  
     });
     
   }

   // Actualizar presupuesto
   actualizarPresupuesto(): void {

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

     this.presupuestosService.actualizarPresupuesto(this.idPresupuesto, data).subscribe(() => {
       this.listarPresupuestos();
     },({error})=>{
       this.alertService.errorApi(error.message);
     });

   }

   // Actualizar estado Activo/Inactivo
   actualizarEstado(presupuesto: any): void {
     
     const { _id, activo } = presupuesto;
     
     if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

     this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
         .then(({isConfirmed}) => {  
           if (isConfirmed) {
             this.alertService.loading();
             this.presupuestosService.actualizarPresupuesto(_id, {activo: !activo}).subscribe(() => {
               this.alertService.loading();
               this.listarPresupuestos();
             }, ({error}) => {
               this.alertService.close();
               this.alertService.errorApi(error.message);
             });
           }
         });

   }

   // Obtener datos de presupuesto
   obtenerPresupuesto(presupuesto: any): void {

    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      presupuesto: presupuesto._id
    }

    this.alertService.loading();

    this.presupuestoProductosService.listarProductos(parametros).subscribe({
      next: ({productos}) => {
        this.productos = productos;
        window.scroll(0,0);
        this.presupuestoSeleccionado = presupuesto;
        this.showModalPresupuesto = true;
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })

   }

   // Generar PDF
   generarPDF(presupuesto: any): void {
    this.alertService.loading();
    this.presupuestosService.generarPDF({ presupuesto: presupuesto._id }).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/presupuesto.pdf`, '_blank');
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
   }

   // Abrir editar presupuesto
   abrirEditarPresupuesto(presupuesto: any): void {

    this.presupuestoSeleccionado = presupuesto;

    this.observacion = presupuesto.observacion;

    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      presupuesto: presupuesto._id
    }

    this.alertService.loading();

    this.presupuestoProductosService.listarProductos(parametros).subscribe({
      next: ({productos}) => {
        this.productos = productos;
        window.scroll(0,0);
        this.presupuestoSeleccionado = presupuesto;
        this.showModalEditarPresupuesto = true;
        this.alertService.close();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })

   }

   // Actualizar observacion
   actualizarObservacion(): void {
    this.alertService.loading();
    const data = {
      observacion: this.observacion,
      updatorUser: this.authService.usuario.userId
    };
    this.presupuestosService.actualizarPresupuesto(this.presupuestoSeleccionado._id, data).subscribe(() => {
      this.observacionActualizadaFlag = true;
      this.listarPresupuestos();
    });
   }

   // Seleccionar producto - Para actualizar
   seleccionarProducto(producto): void {
    this.productoSeleccionado = producto;
    this.cantidad = producto.cantidad;
    this.precio_unitario = producto.precio_unitario;
   }

   // Actualizar producto
   actualizarProducto(): void {

    if(!this.cantidad || this.cantidad < 0){
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    if(!this.precio_unitario || this.precio_unitario < 0){
      this.alertService.info('Debe colocar un precio válido');
      return;
    }

    const data = {
      cantidad: this.cantidad,
      precio_unitario: this.precio_unitario,
      precio_total: this.dataService.redondear(this.cantidad * this.precio_unitario, 2),
      updatorUser: this.authService.usuario.userId
    };
    this.alertService.loading();
    this.presupuestoProductosService.actualizarProducto(this.productoSeleccionado._id, data).subscribe({
      next: () => {
        let precio_total_presupuesto = 0;
        this.productos.map( producto => {
          if(this.productoSeleccionado._id === producto._id){
            producto.cantidad = data.cantidad;
            producto.precio_unitario = data.precio_unitario;
            producto.precio_total = data.precio_total
          }
          precio_total_presupuesto += producto.precio_total;
        })
        this.presupuestoSeleccionado.precio_total = precio_total_presupuesto;
        this.listarPresupuestos();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
   }


   // Eliminar producto

   // Reiniciando formulario
   reiniciarFormulario(): void {
     this.descripcion = '';  
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
     this.listarPresupuestos();
   }

}
