import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from '../../services/auth.service';
import { items } from './items';
import { itemsProductos } from './items-productos';
import { itemsPresupuestos } from './items-presupuestos';
import { itemsVentas } from './items-ventas';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit {

  // Items
  public items: any[];
  public itemsPresupuestos: any[];
  public itemsProductos: any[];
  public itemsVentas: any[];
 
  // Flags - Navegacion
  public administrador = false;
  public showProductos = false;
  public showPresupuestos = false;
  public showVentas = false;

  // Permisos para navegacion
  public permiso_usuarios = true;

  constructor( public authService: AuthService,
               public dataService: DataService ) { }

  ngOnInit(): void {
    this.items = items;
    this.itemsProductos = itemsProductos;
    this.itemsPresupuestos = itemsPresupuestos;
    this.itemsVentas = itemsVentas;
  }
  
  // Habilitacion de navegacion
  habilitacionNavegacion(): void {}

  // Metodo: Cerrar sesion
  logout(): void{ this.authService.logout(); }

}
