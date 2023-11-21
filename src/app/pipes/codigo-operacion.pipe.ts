import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codigoOperacion'
})
export class CodigoOperacionPipe implements PipeTransform {

  transform(value: number): string {
    return  value.toString().padStart(8, '0');
  }

}
