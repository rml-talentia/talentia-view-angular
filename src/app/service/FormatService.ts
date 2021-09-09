import { Injectable } from "@angular/core";
import { TFDateTimeService, TFNumberService } from "@talentia/components";



@Injectable()
export class FormatService {

    constructor(
        private dateTimeService: TFDateTimeService,
        private numberService: TFNumberService
    ) {}

    toString(value: any, format: any): string {
        if (undefined === value || null === value) {
            return '';
        }
        switch (!format ? '' : format.formatType) {
            case 'NumberFormat':
                return this.numberService.numberToString(
                    value, 
                    format.precision, 
                    format.decimalSeparator, 
                    format.thousandsSeparator);
            case 'DateFormat':
                return this.dateTimeService.dateToString(
                    value,
                    false,
                    format.pattern.toUpperCase() /* TODO : not really a correct conversion between java pattern format and TF UI pattern format */);
            default:
                return String(value);
        }
    }

    toValue(text: string, format: any): any {
        return null;
    }

}