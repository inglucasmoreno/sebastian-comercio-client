import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  public usuarioLogin: any = null;
  public permisoPresupuestos: boolean = false;
  public permisoVentasDirectas: boolean = false;
  public permisoVentasPropias: boolean = false;
  public permisoCompras: boolean = false;
  public permisoRecibosCobro: boolean = false;
  public permisoOrdenesPago: boolean = false;
  public permisoCcClientes: boolean = false;
  public permisoCcProveedores: boolean = false;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.usuarioLogin = this.authService.usuario;
    this.calculoPermisos();
    this.dataService.ubicacionActual = 'Dashboard - Home';
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
  }

}
