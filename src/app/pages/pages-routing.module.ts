import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from '../guards/auth.guard';
import { PermisosGuard } from '../guards/permisos.guard';

// Componentes
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { NuevoUsuarioComponent } from './usuarios/nuevo-usuario.component';
import { EditarUsuarioComponent } from './usuarios/editar/editar-usuario.component';
import { EditarPasswordComponent } from './usuarios/editar/editar-password.component';
import { PerfilComponent } from './perfil/perfil.component';
import { UnidadMedidaComponent } from './unidad-medida/unidad-medida.component';
import { ProductosComponent } from './productos/productos.component';
import { ClientesComponent } from './clientes/clientes.component';
import { PresupuestosComponent } from './presupuestos/presupuestos.component';
import { NuevoPresupuestoComponent } from './presupuestos/nuevo-presupuesto.component';
import { FamiliaProductosComponent } from './familia-productos/familia-productos.component';
import { ProveedoresComponent } from './proveedores/proveedores.component';
import { VentasComponent } from './ventas/ventas.component';
import { NuevaVentaComponent } from './ventas/nueva-venta.component';
import { CajasComponent } from './cajas/cajas.component';
import { TiposMovimientosComponent } from './tipos-movimientos/tipos-movimientos.component';
import { MovimientosComponent } from './movimientos/movimientos.component';
import { CcClientesComponent } from './cc-clientes/cc-clientes.component';
import { CcProveedoresComponent } from './cc-proveedores/cc-proveedores.component';
import { CcClientesMovimientosComponent } from './cc-clientes/cc-clientes-movimientos.component';
import { CcProveedoresMovimientosComponent } from './cc-proveedores/cc-proveedores-movimientos.component';
import { BancosComponent } from './bancos/bancos.component';
import { ChequesComponent } from './cheques/cheques.component';
import { VentasPropiasComponent } from './ventas/ventas-propias.component';
import { CajasMovimientosComponent } from './cajas/cajas-movimientos.component';
import { CobrosComponent } from './cobros/cobros.component';
import { NuevoCobroComponent } from './cobros/nuevo-cobro.component';
import { GastosComponent } from './gastos/gastos.component';
import { GastosTiposComponent } from './gastos/gastos-tipos.component';
import { ComprasComponent } from './compras/compras.component';
import { NuevaCompraComponent } from './compras/nueva-compra.component';
import { PagosComponent } from './pagos/pagos.component';
import { NuevoPagoComponent } from './pagos/nuevo-pago.component';
import { MovimientosInternosComponent } from './movimientos-internos/movimientos-internos.component';

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [ AuthGuard ],    // Guard - Se verifica si el usuario esta logueado
        children: [
            
            // Home
            { path: 'home', component: HomeComponent },

            // Perfil de usuarios
            { path: 'perfil', component: PerfilComponent },

            // Usuarios
            { path: 'usuarios', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: UsuariosComponent },
            { path: 'usuarios/nuevo', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: NuevoUsuarioComponent },
            { path: 'usuarios/editar/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarUsuarioComponent },
            { path: 'usuarios/password/:id', data: { permisos: 'USUARIOS_NAV' }, canActivate: [PermisosGuard], component: EditarPasswordComponent },

            // Clientes
            { path: 'clientes', data: { permisos: 'CLIENTES_NAV' }, canActivate: [PermisosGuard], component: ClientesComponent },
    
            // Proveedores
            { path: 'proveedores', data: { permisos: 'PROVEEDORES_NAV' }, canActivate: [PermisosGuard], component: ProveedoresComponent },

            // Unidad medida
            { path: 'unidad-medida', data: { permisos: 'UNIDAD_MEDIDA_NAV' }, canActivate: [PermisosGuard], component: UnidadMedidaComponent },
            
            // Familia de productos
            { path: 'familia-productos', data: { permisos: 'FAMILIA_PRODUCTOS_NAV' }, canActivate: [PermisosGuard], component: FamiliaProductosComponent },

            // Productos
            { path: 'productos', data: { permisos: 'PRODUCTOS_NAV' }, canActivate: [PermisosGuard], component: ProductosComponent },

            // Presupuestos
            { path: 'presupuestos', data: { permisos: 'PRESUPUESTOS_NAV' }, canActivate: [PermisosGuard], component: PresupuestosComponent },
            { path: 'nuevo-presupuesto', data: { permisos: 'PRESUPUESTOS_NAV' }, canActivate: [PermisosGuard], component: NuevoPresupuestoComponent },

            // Ventas
            { path: 'ventas', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasComponent },
            { path: 'nueva-venta', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: NuevaVentaComponent },
            { path: 'ventas-propias', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasPropiasComponent },
            { path: 'ventas-propias/:codigo', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: VentasPropiasComponent },
            { path: 'cc-clientes', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: CcClientesComponent },
            { path: 'cc-clientes-movimientos/:id', data: { permisos: 'VENTAS_NAV' }, canActivate: [PermisosGuard], component: CcClientesMovimientosComponent },

            // Cobros
            { path: 'cobros', data: { permisos: 'COBROS_NAV' }, canActivate: [PermisosGuard], component: CobrosComponent },
            { path: 'cobros/:codigo', data: { permisos: 'COBROS_NAV' }, canActivate: [PermisosGuard], component: CobrosComponent },
            { path: 'nuevo-cobro', data: { permisos: 'COBROS_NAV' }, canActivate: [PermisosGuard], component: NuevoCobroComponent },

            // Caja
            { path: 'cajas', data: { permisos: 'CAJAS_NAV' }, canActivate: [PermisosGuard], component: CajasComponent },
            { path: 'tipos-movimientos', data: { permisos: 'CAJAS_NAV' }, canActivate: [PermisosGuard], component: TiposMovimientosComponent },
            { path: 'movimientos', data: { permisos: 'CAJAS_NAV' }, canActivate: [PermisosGuard], component: MovimientosComponent },
            { path: 'cajas-movimientos/:id', data: { permisos: 'CAJAS_NAV' }, canActivate: [PermisosGuard], component: CajasMovimientosComponent },

            // Movimientos internos
            { path: 'movimientos-internos', data: { permisos: 'TESORERIA_NAV' }, canActivate: [PermisosGuard], component: MovimientosInternosComponent },

            // Cheques
            { path: 'cheques', data: { permisos: 'CHEQUES_NAV' }, canActivate: [PermisosGuard], component: ChequesComponent },

            // Gastos
            { path: 'gastos', data: { permisos: 'GASTOS_NAV' }, canActivate: [PermisosGuard], component: GastosComponent },
            { path: 'tipos-gastos', data: { permisos: 'GASTOS_NAV' }, canActivate: [PermisosGuard], component: GastosTiposComponent },

            // Compras
            { path: 'compras', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: ComprasComponent },
            { path: 'compras/:codigo', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: ComprasComponent },
            { path: 'nueva-compra', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: NuevaCompraComponent },
            { path: 'cc-proveedores', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: CcProveedoresComponent },
            { path: 'cc-proveedores-movimientos/:id', data: { permisos: 'COMPRAS_NAV' }, canActivate: [PermisosGuard], component: CcProveedoresMovimientosComponent },

            // Pagos
            { path: 'pagos', data: { permisos: 'PAGOS_NAV' }, canActivate: [PermisosGuard], component: PagosComponent },
            { path: 'pagos/:codigo', data: { permisos: 'PAGOS_NAV' }, canActivate: [PermisosGuard], component: PagosComponent },
            { path: 'nuevo-pago', data: { permisos: 'PAGOS_NAV' }, canActivate: [PermisosGuard], component: NuevoPagoComponent },

            // Configuraciones
            { path: 'bancos', data: { permisos: 'CONFIGURACIONES_NAV' }, canActivate: [PermisosGuard], component: BancosComponent },

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}