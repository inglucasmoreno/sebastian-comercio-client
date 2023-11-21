import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codigoOperaciones'
})
export class CodigoOperacionesPipe implements PipeTransform {

  transform(value: number): string {
    return  value.toString().padStart(8, '0');
  }

}
