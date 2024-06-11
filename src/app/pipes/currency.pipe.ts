import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currency',
  standalone: true,
})
export class CurrencyPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (isNaN(value)) return value;
    return `L ${parseFloat(value).toFixed(2)}`;
  }
}
