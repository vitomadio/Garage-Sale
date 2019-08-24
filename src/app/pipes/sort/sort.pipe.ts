import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../../../models/product-model';

@Pipe({
  name: 'sort'
})
export class SortPipe implements PipeTransform {

  transform(value: [Product], args: boolean): any {
    if (args == false) {
      const defaultValue = value;
      return defaultValue;
    } else {
      value.sort((a, b) => {
        return a.price - b.price
      });
      return value
    }
  }

}
