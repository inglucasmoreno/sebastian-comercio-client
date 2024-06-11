import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CajasService } from 'src/app/services/cajas.service';
import { DataService } from 'src/app/services/data.service';
import { GastosService } from 'src/app/services/gastos.service';
import { ReportesService } from 'src/app/services/reportes.service';
import { TiposGastosService } from 'src/app/services/tipos-gastos.service';
import { saveAs } from 'file-saver-es';

@Component({
  selector: 'app-gastos',
  templateUrl: './gastos.component.html',
  styles: [
  ]
})
export class GastosComponent implements OnInit {

  // Cajas
  public cajas: any = [];

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalGasto = false;
  public showModalReportesGastos = false;

  // Reportes
  public reportes = {
    fechaDesde: '',
    fechaHasta: '',
    activas: 'true'
  };

  // Estado formulario
  public estadoFormulario = 'crear';

  // Gastos
  public idGasto: string = '';
  public gastos: any = [];
  public gastoSeleccionado: any;
  public dataGasto = {
    fecha_gasto: format(new Date(), 'yyyy-MM-dd'),
    caja: '',
    tipo_gasto: '',
    monto: null,
    observacion: ''
  }
  public tiposGastos: any[] = []

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'numero'
  }

  constructor(
    private gastosService: GastosService,
    private reportesService: ReportesService,
    private tiposGastosService: TiposGastosService,
    private cajasService: CajasService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Gastos';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.calculosIniciales();
  }

  calculosIniciales(): void {

    // Listando cajas
    this.cajasService.listarCajas().subscribe({
      next: ({ cajas }) => {

        this.cajas = cajas.filter(caja => caja.activo && caja._id !== '222222222222222222222222');

        if (this.authService.usuario.role !== 'ADMIN_ROLE')
          this.cajas = this.cajas.filter(caja => this.authService.usuario.permisos_cajas.includes(caja._id.toString()))

        // Listando tipos de gastos
        this.tiposGastosService.listarTipos().subscribe({
          next: ({ tipos }) => {
            this.tiposGastos = tipos.filter(tipo => tipo.activo);
            this.listarGastos();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('GASTOS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, gasto: any = null): void {
    window.scrollTo(0, 0);
    this.reiniciarFormulario();
    this.dataGasto = {
      fecha_gasto: format(new Date(), 'yyyy-MM-dd'),
      caja: '',
      tipo_gasto: '',
      monto: null,
      observacion: ''
    }
    this.idGasto = '';

    if (estado === 'editar') this.getGasto(gasto);
    else this.showModalGasto = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de gasto
  getGasto(gasto: any): void {
    this.alertService.loading();
    this.idGasto = gasto._id;
    this.gastoSeleccionado = gasto;
    this.gastosService.getGasto(gasto._id).subscribe(({ gasto }) => {
      this.dataGasto = {
        fecha_gasto: format(new Date(gasto.fecha_gasto), 'yyyy-MM-dd'),
        caja: gasto.caja._id,
        tipo_gasto: gasto.tipo_gasto._id,
        monto: gasto.monto,
        observacion: gasto.observacion
      }
      this.alertService.close();
      this.showModalGasto = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar gastos
  listarGastos(): void {
    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      creatorUser: this.authService.usuario.role !== 'ADMIN_ROLE' ? this.authService.usuario.userId : '',
      desde: this.desde,
      cantidadItems: this.cantidadItems,
      activo: this.filtro.activo,
      parametro: this.filtro.parametro,
    }
    this.gastosService.listarGastos(parametros)
      .subscribe(({ gastos, totalItems }) => {
        this.gastos = gastos;
        this.totalItems = totalItems;
        this.showModalGasto = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nuevo gasto
  nuevoGasto(): void {

    // Validacion

    if (this.dataGasto.caja.trim() === '') {
      this.alertService.info('Debe seleccionar una caja');
      return;
    }

    if (this.dataGasto.tipo_gasto.trim() === '') {
      this.alertService.info('Debe seleccionar un tipo de gasto');
      return;
    }

    if (!this.dataGasto.monto || this.dataGasto.monto <= 0) {
      this.alertService.info('Debe colocar un monto');
      return;
    }

    this.alertService.loading();

    const data = {
      ...this.dataGasto,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.gastosService.nuevoGasto(data).subscribe(() => {
      this.listarGastos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar gasto
  actualizarGasto(): void {

    // Validacion

    this.alertService.loading();

    const data = {
      ...this.dataGasto,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.gastosService.actualizarGasto(this.idGasto, data).subscribe(() => {
      this.listarGastos();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(gasto: any): void {

    const { _id, activo } = gasto;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.gastosService.actualizarGasto(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarGastos();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Alta/Baja de gasto
  altaBajaGasto(gasto: any): void {

    this.alertService.question({ msg: gasto.activo ? 'Baja de gasto' : 'Alta de gasto', buttonText: gasto.activo ? 'Baja' : 'Alta' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const data = {
            activo: gasto.activo ? false : true,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          }
          this.gastosService.altaBajaGasto(gasto._id, data).subscribe({
            next: () => {
              this.listarGastos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

  // Abrir reportes - Excel
  abrirReportes(): void {
    this.reportes.fechaDesde = '';
    this.reportes.fechaHasta = '';
    this.reportes.activas = 'true';
    this.showModalReportesGastos = true;
  }

  // Reporte - Excel
  reporteExcel(): void{
    this.alertService.question({ msg: 'Generando reporte', buttonText: 'Generar' })
    .then(({isConfirmed}) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.reportesService.gastosExcel(this.reportes).subscribe({
          next: (buffer) => {
            const blob = new Blob([buffer.body], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `Reporte - Gastos - ${format(new Date(),'dd-MM-yyyy')}`);
            this.showModalReportesGastos = false;
            this.alertService.close();
          }, error: ({error}) => this.alertService.errorApi(error.message)
        });
      }
    });
  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.dataGasto = {
      fecha_gasto: format(new Date(), 'yyyy-MM-dd'),
      caja: '',
      tipo_gasto: '',
      monto: null,
      observacion: ''
    }
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
    this.listarGastos();
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarGastos();
  }

  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }


}
