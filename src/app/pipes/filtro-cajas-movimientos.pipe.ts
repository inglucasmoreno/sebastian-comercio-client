import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroCajasMovimientos'
})
export class FiltroCajasMovimientosPipe implements PipeTransform {

  transform(valores: any[], parametro: string): any {
        
    // Filtrado por parametro
    parametro = parametro.toLocaleLowerCase();
    
    if(parametro.length !== 0){
      return valores.filter( valor => { 
        return valor.descripcion.toLocaleLowerCase().includes(parametro)
      });
    }else{
      return valores;
    }

  }

}
