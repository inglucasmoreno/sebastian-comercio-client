import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaPipe } from './fecha.pipe';
import { RolPipe } from './rol.pipe';
import { MonedaPipe } from './moneda.pipe';
import { FiltroUsuariosPipe } from './filtro-usuarios.pipe';
import { FiltroUnidadMedidaPipe } from './filtro-unidad-medida.pipe';
import { FiltroClientesPipe } from './filtro-clientes.pipe';
import { FiltroFamiliaProductosPipe } from './filtro-familia-productos.pipe';
import { FiltroPresupuestosPipe } from './filtro-presupuestos.pipe';
import { FiltroProductosPipe } from './filtro-productos.pipe';
import { FiltroProveedoresPipe } from './filtro-proveedores.pipe';
import { CodigoPresupuestoPipe } from './codigo-presupuesto.pipe';
import { CodigoVentasPipe } from './codigo-ventas.pipe';
import { FiltroVentasPipe } from './filtro-ventas.pipe';

@NgModule({
  declarations: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroUnidadMedidaPipe,
    FiltroClientesPipe,
    FiltroFamiliaProductosPipe,
    FiltroPresupuestosPipe,
    FiltroProductosPipe,
    FiltroProveedoresPipe,
    CodigoPresupuestoPipe,
    CodigoVentasPipe,
    FiltroVentasPipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    FechaPipe,
    RolPipe,
    MonedaPipe,
    FiltroUsuariosPipe,
    FiltroUnidadMedidaPipe,
    FiltroClientesPipe,
    FiltroFamiliaProductosPipe,
    FiltroPresupuestosPipe,
    FiltroProductosPipe,
    FiltroProveedoresPipe,
    CodigoPresupuestoPipe,
    CodigoVentasPipe,
    FiltroVentasPipe
  ]
})
export class PipesModule { }
