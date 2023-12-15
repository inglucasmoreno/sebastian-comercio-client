import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-statebar',
  templateUrl: './statebar.component.html',
  styles: [
  ]
})
export class StatebarComponent implements OnInit {

  public usuarioLogin: any = null;
  public permisoPresupuestos: boolean = false;
  public permisoVentasDirectas: boolean = false;
  public permisoVentasPropias: boolean = false;
  public permisoCompras: boolean = false;
  public permisoRecibosCobro: boolean = false;
  public permisoOrdenesPago: boolean = false;
  public permisoCcClientes: boolean = false;
  public permisoCcProveedores: boolean = false;
  public permisoOperaciones: boolean = false;

  constructor(
    private authService: AuthService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.usuarioLogin = this.authService.usuario;
    this.calculoPermisos();
  }

  calculoPermisos(): void {
    this.permisoPresupuestos = this.usuarioLogin.permisos.includes('PRESUPUESTOS_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoVentasDirectas = this.usuarioLogin.permisos.includes('VENTAS_DIRECTAS_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoVentasPropias = this.usuarioLogin.permisos.includes('VENTAS_PROPIAS_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoCompras = this.usuarioLogin.permisos.includes('COMPRAS_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoRecibosCobro = this.usuarioLogin.permisos.includes('RECIBOS_COBRO_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoOrdenesPago = this.usuarioLogin.permisos.includes('ORDENES_PAGO_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoCcClientes = this.usuarioLogin.permisos.includes('CUENTAS_CORRIENTES_CLIENTES_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoCcProveedores = this.usuarioLogin.permisos.includes('CUENTAS_CORRIENTES_PROVEEDORES_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
    this.permisoOperaciones = this.usuarioLogin.permisos.includes('OPERACIONES_NAV') || this.usuarioLogin.role === 'ADMIN_ROLE';
  }

  // Metodo: Cerrar sesion
  logout(): void { this.authService.logout(); }

}
