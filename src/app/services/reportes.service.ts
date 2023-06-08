import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) { }

  // REPORETS - EXCEL

  // Reporte -> Compras
  comprasExcel(parametros: { fechaDesde: string, fechaHasta: string }): Observable<any> {
    return this.http.get(`${base_url}/reportes/excel/compras`, {
      headers: this.getToken,
      responseType: 'blob',
      observe: 'response',
      params: parametros
    });
  }

  // Reporte -> Ventas
  ventasExcel(parametros: { fechaDesde: string, fechaHasta: string }): Observable<any> {
    return this.http.get(`${base_url}/reportes/excel/ventas`, {
      headers: this.getToken,
      responseType: 'blob',
      observe: 'response',
      params: parametros
    });
  }

  // Reporte -> Ventas propias
  ventasPropiasExcel(parametros: { fechaDesde: string, fechaHasta: string }): Observable<any> {
    return this.http.get(`${base_url}/reportes/excel/ventas-propias`, {
      headers: this.getToken,
      responseType: 'blob',
      observe: 'response',
      params: parametros
    });
  }

  // Reporte -> Recibos cobro
  recibosCobroExcel(parametros: { fechaDesde: string, fechaHasta: string }): Observable<any> {
    return this.http.get(`${base_url}/reportes/excel/recibos-cobro`, {
      headers: this.getToken,
      responseType: 'blob',
      observe: 'response',
      params: parametros
    });
  }

  // Reporte -> Ordenes pago
  ordenesPagoExcel(parametros: { fechaDesde: string, fechaHasta: string }): Observable<any> {
    return this.http.get(`${base_url}/reportes/excel/ordenes-pago`, {
      headers: this.getToken,
      responseType: 'blob',
      observe: 'response',
      params: parametros
    });
  }

}
