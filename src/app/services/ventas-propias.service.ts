import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class VentasPropiasService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nueva venta
  nuevaVenta(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-propias`, data, {
      headers: this.getToken
    });
  };

  // Generar PDF
  generarPDF(data: any): Observable<any> {
    return this.http.post(`${base_url}/ventas-propias/generarPDF`, data, {
      headers: this.getToken
    });
  };

  // Generar Excel
  generarExcel(): Observable<any> {
    return this.http.get(`${base_url}/ventas-propias/reporte/excel`, {
      headers: this.getToken
    });
  };

  // Venta por ID
  getVenta(id: string): Observable<any> {
    return this.http.get(`${base_url}/ventas-propias/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar ventas
  listarVentas(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/ventas-propias`, {
      params: {
        direccion: parametros?.direccion || 1,
        columna: parametros?.columna || 'descripcion',
        cliente: parametros?.cliente || '',
        cancelada: parametros?.cancelada || '',
      },
      headers: this.getToken
    });
  }

  // Actualizar ventas
  actualizarVenta(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/ventas-propias/${id}`, data, {
      headers: this.getToken
    });
  }    

}
