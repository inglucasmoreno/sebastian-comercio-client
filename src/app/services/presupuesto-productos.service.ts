import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class PresupuestoProductosService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nuevo producto
  nuevoProducto(data: any): Observable<any> {
    return this.http.post(`${base_url}/presupuesto-productos`, data, {
      headers: this.getToken
    });
  };

  // Producto por ID
  getProducto(id: string): Observable<any> {
    return this.http.get(`${base_url}/presupuesto-productos/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar productos
  listarProductos(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/presupuesto-productos`, {
      params: {
        direccion: parametros?.direccion || 1,
        columna: parametros?.columna || 'descripcion'
      },
      headers: this.getToken
    });
  }

  // Actualizar producto
  actualizarProducto(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/presupuesto-productos/${id}`, data, {
      headers: this.getToken
    });
  }  

}