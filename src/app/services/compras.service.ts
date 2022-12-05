import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) { }

  // Nueva compra
  nuevaCompra(data: any): Observable<any> {
    return this.http.post(`${base_url}/compras`, data, {
      headers: this.getToken
    });
  };

  // Compra por ID
  getCompra(id: string): Observable<any> {
    return this.http.get(`${base_url}/compras/${id}`, {
      headers: this.getToken
    });
  };

  // Listar compras
  listarCompras(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/compras`, {
      params: {
        direccion: parametros?.direccion || 1,
        columna: parametros?.columna || 'descripcion'
      },
      headers: this.getToken
    });
  }

  // Actualizar compra
  actualizarCompra(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/compras/${id}`, data, {
      headers: this.getToken
    });
  }

}
