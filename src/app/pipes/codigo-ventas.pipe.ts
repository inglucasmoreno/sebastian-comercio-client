import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codigoVentas'
})
export class CodigoVentasPipe implements PipeTransform {

  transform(nro: number): string {
    let codigo: string;
    if(nro <= 9)  codigo = 'V000000' + String(nro);
    else if(nro <= 99) codigo = 'V00000' + String(nro);
    else if(nro <= 999) codigo = 'V0000' + String(nro);
    else if(nro <= 9999) codigo = 'V000' + String(nro);
    else if(nro <= 99999) codigo = 'V00' + String(nro);
    else if(nro <= 999999) codigo = 'V0' + String(nro);   
    return codigo;         
  }

}
