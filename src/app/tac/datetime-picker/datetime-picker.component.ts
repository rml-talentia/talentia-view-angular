import { ChangeDetectionStrategy, Component, forwardRef, Input, NgZone, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFDateTimePickerComponent, TFDateTimeService, TFEvent } from '@talentia/components';
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

  @ViewChild(TFDateTimePickerComponent)
  input!: TFDateTimePickerComponent;

  constructor(
    private dateTimeService: TFDateTimeService,
    private ngZone: NgZone) {
    super();
  }

  get value() {
    return this.component.value;
  }

  set value(value: any) {
    this.component.value = value;
  }

  get rawValue() {
    return this.valueAsRawValue(this.value);
  }

  set rawValue(rawValue) {
    this.value = this.rawValueAsValue(rawValue);
  }

  private valueAsDate(value: string | null): Date | null {
    return null === value ? null : this.dateTimeService.stringToDate(value, false, 'DD/MM/YYYY'); // TODO : get format from component (view model) 
  }

  private valueAsRawValue(value: string | null) {
    return null === value ? null : this.dateTimeService.dateToString(this.valueAsDate(value) as Date, false);
  }

  private rawValueAsValue(rawValue: string | null) {
    return null === rawValue ? null : this.dateTimeService.dateToString(this.dateTimeService.stringToDate(rawValue as string), false, 'DD/MM/YYYY');
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
      // TODO : is this required ?
      setTimeout(() => {
        input.select();
      });
    });
  }
 
  writeValue(value: any): void {
    console.debug('[DatePickerComponent] writeValue(value:', value, ')');
    this.value = value;
  }

  onBlur(event: TFEvent) {
    console.debug('[DatePickerComponent] onBlur(', event, ')');
    // Force sets value.
    // It is a workaround, there is a bug at core-components level ?
    setTimeout(() => {
      this.ngZone.run(() => {
        this.value = event.source.el.nativeElement.querySelector('input').value;
      });
    });
  }
}
