import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CajasService } from 'src/app/services/cajas.service';
import { DataService } from 'src/app/services/data.service';
import { InicializacionService } from 'src/app/services/inicializacion.service';

@Component({
  selector: 'app-cajas',
  templateUrl: './cajas.component.html',
  styles: [
  ]
})
export class CajasComponent implements OnInit {

  // Flags
  public flagInicializacion = false;

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalCaja = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Caja
  public idCaja: string = '';
  public cajas: any = [];
  public monto: number = null;
  public cajaSeleccionada: any;
  public descripcion: string = '';

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

  constructor(private cajasService: CajasService,
              private inicializacionService: InicializacionService,
              private authService: AuthService,
              private alertService: AlertService,
              private dataService: DataService) { }

    ngOnInit(): void {
      this.dataService.ubicacionActual = 'Dashboard - Saldos'; 
      this.permisos.all = this.permisosUsuarioLogin();
      this.alertService.loading();
      this.listarCajas(); 
    }

    // Asignar permisos de usuario login
    permisosUsuarioLogin(): boolean {
      return this.authService.usuario.permisos.includes('CAJAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
    }

    // Abrir modal
    abrirModal(estado: string, caja: any = null): void {
      window.scrollTo(0,0);
      this.reiniciarFormulario();
      this.descripcion = '';
      this.monto = null;
      this.idCaja = '';
      
      if(estado === 'editar') this.getCaja(caja);
      else this.showModalCaja = true;

      this.estadoFormulario = estado;  
    }

    // Traer datos de caja
    getCaja(caja: any): void {
      this.alertService.loading();
      this.idCaja = caja._id;
      this.cajaSeleccionada = caja;
      this.cajasService.getCaja(caja._id).subscribe(({caja}) => {
        this.descripcion = caja.descripcion;
        this.monto = caja.saldo;
        this.alertService.close();
        this.showModalCaja = true;
      },({error})=>{
        this.alertService.errorApi(error);
      });
    }

    // Listar cajas
    listarCajas(): void {
      const parametros = {
        direccion: this.ordenar.direccion,
        columna: this.ordenar.columna
      }
      this.cajasService.listarCajas(parametros)
      .subscribe( ({ cajas }) => {
        this.cajas = cajas;
        this.showModalCaja = false;

        if(this.flagInicializacion){
          this.flagInicializacion = false;
          this.alertService.success('Inicializacion completada');
        }else{
          this.alertService.close();
        }

      }, (({error}) => {
        this.alertService.errorApi(error.msg);
      }));
    }

    // Nueva caja
    nuevaCaja(): void {

      // Verificacion: Descripción vacia
      if(this.descripcion.trim() === ""){
        this.alertService.info('Debes colocar una descripción');
        return;
      }

      // Verificacion: Monto inicial vacia
      if(!this.monto){
        this.alertService.info('Debes colocar un monto');
        return;
      }

      this.alertService.loading();

      const data = {
        descripcion: this.descripcion,
        saldo: this.dataService.redondear(this.monto, 2),
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
      }

      this.cajasService.nuevaCaja(data).subscribe(() => {
        this.listarCajas();
      },({error})=>{
        this.alertService.errorApi(error.message);  
      });
      
    }

    // Actualizar caja
    actualizarCaja(): void {

      // Verificacion: Descripción vacia
      if(this.descripcion.trim() === ""){
        this.alertService.info('Debes colocar una descripción');
        return;
      }

      // Verificacion: Monto inicial vacia
      if(!this.monto){
        this.alertService.info('Debes colocar un monto');
        return;
      }

      this.alertService.loading();

      const data = {
        descripcion: this.descripcion,
        saldo: this.monto,
        updatorUser: this.authService.usuario.userId,
      }

      this.cajasService.actualizarCaja(this.idCaja, data).subscribe(() => {
        this.listarCajas();
      },({error})=>{
        this.alertService.errorApi(error.message);
      });
    }

    // Actualizar estado Activo/Inactivo
    actualizarEstado(caja: any): void {
      
      const { _id, activo } = caja;
      
      if(!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

      if(caja._id === '000000000000000000000000' || caja._id === '111111111111111111111111' || caja._id === '222222222222222222222222' || caja._id === '333333333333333333333333'){
        this.alertService.info('No se puede dar de baja a este saldo');
        return;
      }

      this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
          .then(({isConfirmed}) => {  
            if (isConfirmed) {
              this.alertService.loading();
              this.cajasService.actualizarCaja(_id, {activo: !activo}).subscribe(() => {
                this.alertService.loading();
                this.listarCajas();
              }, ({error}) => {
                this.alertService.close();
                this.alertService.errorApi(error.message);
              });
            }
          });

    }

    // Inicializar saldos
    inicializarSaldos(): void {
      this.alertService.question({ msg: '¿Quieres inicializar los saldos?', buttonText: 'Inicializar' })
          .then(({isConfirmed}) => {  
            if (isConfirmed) {
              this.alertService.loading();
              this.inicializacionService.inicializarSaldos(this.authService.usuario.userId).subscribe({
                next: () => {
                  this.flagInicializacion = true;
                  this.listarCajas();
                },
                error: ({error}) => this.alertService.errorApi(error.message)
              })
            }
          });
    }

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
      this.listarCajas();
    }


}
