import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class OperacionesVentasPropiasService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nueva OperacionVentaPropia
  nuevaOperacionVentaPropia(data: any): Observable<any> {
    return this.http.post(`${base_url}/operaciones-ventas-propias`, data, {
      headers: this.getToken
    });
  };

  // OperacionVentaPropia por ID
  getOperacionVentaPropia(id: string): Observable<any> {
    return this.http.get(`${base_url}/operaciones-ventas-propias/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar OperacionesVentasPropias
  listarOperacionesVentasPropias(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/operaciones-ventas-propias`, {
      params: {
        direccion: parametros?.direccion || -1,
        columna: parametros?.columna || 'createdAt'
      },
      headers: this.getToken
    });
  }

  // Actualizar OperacionesVentasPropias
  actualizarOperacionVentaPropia(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/operaciones-ventas-propias/${id}`, data, {
      headers: this.getToken
    });
  }  

  // Eliminar OperacionesVentasPropias
  eliminarOperacionVentaPropia(id:string): Observable<any> {
    return this.http.delete(`${base_url}/operaciones-ventas-propias/${id}`, {
      headers: this.getToken
    });
  }

}
