import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from '../../services/auth.service';
import { items } from './items';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit {

  // Items
  public items: any[];
 
  // Flags - Navegacion
  public administrador = false;

  // Permisos para navegacion
  public permiso_usuarios = true;

  constructor( public authService: AuthService,
               public dataService: DataService ) { }

  ngOnInit(): void {
    // console.log(this.authService.usuario);
    this.items = items;
  }
  
  // Habilitacion de navegacion
  habilitacionNavegacion(): void {

  }

  // Metodo: Cerrar sesion
  logout(): void{ this.authService.logout(); }

}
