import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nueva venta
  nuevaVenta(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas`, data, {
      headers: this.getToken
    });
  };

  // Generar PDF
  generarPDF(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas/generarPDF`, data, {
      headers: this.getToken
    });
  };

  // Venta por ID
  getVenta(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar ventas
  listarVentas(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/ventas`, {
      params: {
        direccion: parametros?.direccion || 1,
        columna: parametros?.columna || 'descripcion'
      },
      headers: this.getToken
    });
  }

  // Actualizar ventas
  actualizarVenta(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas/${id}`, data, {
      headers: this.getToken
    });
  }  


}