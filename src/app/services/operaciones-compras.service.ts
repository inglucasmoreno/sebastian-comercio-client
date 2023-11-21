import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class OperacionesComprasService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nueva OperacionCompra
  nuevaOperacionCompra(data: any): Observable<any> {
    return this.http.post(`${base_url}/operaciones-compras`, data, {
      headers: this.getToken
    });
  };

  // OperacionCompra por ID
  getOperacionCompra(id: string): Observable<any> {
    return this.http.get(`${base_url}/operaciones-compras/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar OperacionesCompras
  listarOperacionesCompras(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/operaciones-compras`, {
      params: {
        direccion: parametros?.direccion || -1,
        columna: parametros?.columna || 'createdAt'
      },
      headers: this.getToken
    });
  }

  // Actualizar OperacionesCompras
  actualizarOperacionCompra(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/operaciones-compras/${id}`, data, {
      headers: this.getToken
    });
  }  

  // Eliminar OperacionesCompras
  eliminarOperacionCompra(id:string): Observable<any> {
    return this.http.delete(`${base_url}/operaciones-compras/${id}`, {
      headers: this.getToken
    });
  }

}
