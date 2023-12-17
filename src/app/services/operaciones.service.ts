import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { es } from 'date-fns/locale';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) { }

  // Nueva operacion
  nuevaOperacion(data: any): Observable<any> {
    return this.http.post(`${base_url}/operaciones`, data, {
      headers: this.getToken
    });
  };

  // Operacion por ID
  getOperacion(id: string): Observable<any> {
    return this.http.get(`${base_url}/operaciones/${id}`, {
      headers: this.getToken
    });
  };

  // Imprimir - Detalles de operacion
  imprimirDetalles(id: string): Observable<any> {
    return this.http.get(`${base_url}/operaciones/imprimir-detalles/${id}`, {
      headers: this.getToken
    });
  };


  // Listar operaciones
  listarOperaciones(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/operaciones`, {
      params: {
        columna: parametros?.columna || 'descripcion',
        direccion: parametros?.direccion || 1,
        desde: parametros?.desde || 0,
        estado: parametros?.estado || '',
        registerpp: parametros?.cantidadItems || 100000,
        activo: parametros?.activo || '',
        parametro: parametros?.parametro || '',
      },
      headers: this.getToken
    });
  }

  // Actualizar operaciones
  actualizarOperacion(id: string, data: any): Observable<any> {
    return this.http.put(`${base_url}/operaciones/${id}`, data, {
      headers: this.getToken
    });
  }

  // Completar operaciones
  completarOperacion(id: string): Observable<any> {
    return this.http.put(`${base_url}/operaciones/completar/${id}`, {}, {
      headers: this.getToken
    });
  }

}
