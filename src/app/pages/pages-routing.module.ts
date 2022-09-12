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

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {}