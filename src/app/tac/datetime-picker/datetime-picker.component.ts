import { ChangeDetectionStrategy, Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFDateTimePickerComponent, TFDateTimeService } from '@talentia/components';
import { InputBaseComponent } from '../base/input-base.component';

import { ICellEditorAngularComp } from "ag-grid-angular";
import { IAfterGuiAttachedParams } from '@ag-grid-community/core';


@Component({
  selector: 'tac-datetime-picker',
  templateUrl: './datetime-picker.component.html',
  styleUrls: ['./datetime-picker.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => DatetimePickerComponent)
  }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatetimePickerComponent extends InputBaseComponent  {



  private _value: string = '';
  private _rawValue: string = '';

  @ViewChild(TFDateTimePickerComponent)
  input!: TFDateTimePickerComponent;


  constructor(private dateTimeService: TFDateTimeService) {
    super();
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

  createCellEditor(): ICellEditorAngularComp {
    return  <ICellEditorAngularComp> {       
        
      agInit: (params) => {
        this.value = params.value;
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => {
        this.focus();
      },

      getValue: () => {
        return this.value;
      }

    };
  }

  focus(): void {
    // Used in ag-grid cell editor.
    // setTimeout is mostly needed by select()...
    // This is a tweak but agGrid documentation himself uses it.
    
    const input = (this.input as any).el.nativeElement.querySelector('input.form-control');
    setTimeout(() => {
      input.focus();
      setTimeout(() => {
        input.select();
      });
    });
  }
 
  writeValue(value: any): void {
    this.value = value;
  }

}
