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
    FiltroProveedoresPipe
  ]
})
export class PipesModule { }
