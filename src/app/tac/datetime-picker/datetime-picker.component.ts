import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFDateTimeService } from '@talentia/components';

@Component({
  selector: 'tac-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => DatetimePickerComponent)
  }]
})
export class DatetimePickerComponent implements OnInit, ControlValueAccessor {

  @Input()
  form!: FormGroup;
  @Input()
  name!: string;
  @Input()
  data!: any;  
  @Input()
  title!: string;
  private onchange: any;
  private ontouched: any;

  private _value: string = '';
  private _rawValue: string = '';



  constructor(private dateTimeService: TFDateTimeService) {
  }

  ngOnInit(): void {
  }

  @Input()
  get value() {
    return this._value;
  }

  set value(value) {
    const date = this.dateTimeService.stringToDate(value, false, 'DD/MM/YYYY');
    this._rawValue = this.dateTimeService.dateToString(date, false);
    this._value = value;
    this.fireChange(value);
  }

  get rawValue() {
    return this._rawValue;
  }

  set rawValue(rawValue) {
    const date = this.dateTimeService.stringToDate(rawValue);
    this._rawValue = rawValue;
    this._value = this.dateTimeService.dateToString(date, false, 'DD/MM/YYYY');
    this.fireChange(this._value);
  }
  
  private fireChange(newValue: any): void {
    if (!!this.onchange) {
      this.onchange(newValue);
    }
  }
 
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(onchange: any): void {
    this.onchange = onchange;
  }
 
  registerOnTouched(ontouched: any): void {
    this.ontouched = ontouched;
  }
}
