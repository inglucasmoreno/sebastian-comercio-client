import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  public ubicacionActual: string = 'Dashboard';  // Statebar - Direccion actual
  public showMenu: Boolean = true;               // Header - Controla la visualizacion de la barra de navegacion

  constructor() {}
    
}
