import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { OperacionesService } from 'src/app/services/operaciones.service';

@Component({
  selector: 'app-operaciones',
  templateUrl: './operaciones.component.html',
  styles: [
  ]
})
export class OperacionesComponent implements OnInit {


  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalOperacion = false;

  // Estado formulario
  public estadoFormulario = 'crear';

  // Operacion
  public idOperacion: string = '';
  public operaciones: any = [];
  public operacionSeleccionada: any;
  public descripcion: string = '';

  public formOperacion = {
    fecha_operacion: format(new Date(), 'yyyy-MM-dd'),
    creatorUser: this.authService.usuario.userId,
    updatorUser: this.authService.usuario.userId,
  }

  // Paginacion
  public totalItems: number;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;
  public desde: number = 0;

  // Filtrado
  public filtro = {
    activo: 'true',
    estado: 'Abierta',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(
    private operacionesService: OperacionesService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Operaciones';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarOperaciones();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('OPERACIONES_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, operacion: any = null): void {
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idOperacion = '';

    if (estado === 'editar') this.getOperacion(operacion);
    else this.showModalOperacion = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de operacion
  getOperacion(operacion: any): void {
    this.alertService.loading();
    this.idOperacion = operacion._id;
    this.operacionSeleccionada = operacion;
    this.operacionesService.getOperacion(operacion._id).subscribe(({ operacion }) => {
      this.descripcion = operacion.descripcion;
      this.alertService.close();
      this.showModalOperacion = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar operaciones
  listarOperaciones(): void {
    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      desde: this.desde,
      estado: this.filtro.estado,
      cantidadItems: this.cantidadItems,
      activo: this.filtro.activo,
      parametro: this.filtro.parametro
    }
    this.operacionesService.listarOperaciones(parametros)
      .subscribe(({ operaciones }) => {
        this.operaciones = operaciones;
        this.showModalOperacion = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nueva operacion
  nuevaOperacion(): void {

    // Se verifica que haya una fecha de operacion
    if (this.formOperacion.fecha_operacion === '') {
      this.alertService.info('Debes colocar una fecha de operación');
      return;
    }

    this.alertService.loading();

    const data = {
      fecha_operacion: this.formOperacion.fecha_operacion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.operacionesService.nuevaOperacion(data).subscribe(({ operacion }) => {
      this.router.navigateByUrl('/dashboard/operaciones/detalles/' + operacion._id);
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

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
    this.listarOperaciones();
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
    this.listarOperaciones();
  }

}
