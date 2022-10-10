import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class RecibosCobrosService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nuevo recibo de cobro
  nuevoRecibo(data: any): Observable<any> {
    return this.http.post(`${base_url}/recibo-cobro`, data, {
      headers: this.getToken
    });
  };

  // Recibo cobro por ID
  getRecibo(id: string): Observable<any> {
    return this.http.get(`${base_url}/recibo-cobro/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar recibos de cobro
  listarRecibos(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/recibo-cobro`, {
      params: {
        direccion: parametros?.direccion || 1,
        columna: parametros?.columna || 'descripcion'
      },
      headers: this.getToken
    });
  }

  // Actualizar recibo de cobro
  actualizarRecibo(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/recibo-cobro/${id}`, data, {
      headers: this.getToken
    });
  }  

}
