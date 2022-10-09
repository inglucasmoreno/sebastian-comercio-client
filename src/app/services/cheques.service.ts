import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Injectable({
  providedIn: 'root'
})
export class ChequesService {

  get getToken(): any {
    return {
      'Authorization': localStorage.getItem('token')
    };
  }

  constructor(private http: HttpClient) {}

  // Nuevo cheque
  nuevoCheque(data: any): Observable<any> {
    return this.http.post(`${base_url}/cheques`, data, {
      headers: this.getToken
    });
  };

  // Cheque por ID
  getCheque(id: string): Observable<any> {
    return this.http.get(`${base_url}/cheques/${ id }`,{ 
      headers: this.getToken
    });
  };

  // Listar cheques
  listarCheques(parametros?: any): Observable<any> {
    return this.http.get(`${base_url}/cheques`, {
      params: {
        direccion: parametros?.direccion || 1,
        columna: parametros?.columna || 'descripcion'
      },
      headers: this.getToken
    });
  }

  // Actualizar cheque
  actualizarCheque(id:string, data: any): Observable<any> {
    return this.http.put(`${base_url}/cheques/${id}`, data, {
      headers: this.getToken
    });
  }  

  
  // Eliminar cheque
  eliminarCheque(id:string): Observable<any> {
    return this.http.delete(`${base_url}/cheques/${id}`, {
      headers: this.getToken
    });
  }  

}
