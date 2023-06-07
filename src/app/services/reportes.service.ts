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
  comprasExcel(): Observable<any> {
    return this.http.get(`${base_url}/reportes/excel/compras`, {
      headers: this.getToken,
      responseType: 'blob',
      observe: 'response'
    });
  }

}
