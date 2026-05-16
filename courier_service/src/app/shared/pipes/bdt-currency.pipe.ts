import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bdtCurrency',
  standalone: true
})
export class BdtCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | undefined | null, 
    displaySymbol: boolean = true, 
    digitsInfo: string = '1.2-2'
  ): string {
    if (value === null || value === undefined || value === '') {
      return displaySymbol ? '৳0.00' : '0.00';
    }

    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numericValue)) {
      return displaySymbol ? '৳0.00' : '0.00';
    }

    const [, fractionPart] = digitsInfo.split('.');
    const [minFraction, maxFraction] = fractionPart ? fractionPart.split('-') : ['2', '2'];
    
    const minFractionDigits = parseInt(minFraction, 10);
    const maxFractionDigits = parseInt(maxFraction, 10);

    const formattedNumber = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    }).format(numericValue);

    return displaySymbol ? `৳${formattedNumber}` : formattedNumber;
  }
}