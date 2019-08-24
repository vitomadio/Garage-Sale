import { Pipe, PipeTransform } from '@angular/core';
import { cleanSession } from 'selenium-webdriver/safari';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, args: string): any {
    if (!args) return value;
    return value.filter(item => item.title.toLowerCase().includes(args.toLowerCase()));
  }

}
