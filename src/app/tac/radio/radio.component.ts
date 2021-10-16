import { Component, forwardRef, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TFEvent } from '@talentia/components';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { InputBaseComponent } from '../base/input-base.component';

@Component({
  selector: 'tac-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => RadioComponent)
  }]
})
export class RadioComponent extends InputBaseComponent  {
  
  constructor() {
    super();    
  }

  ngOnInit(): void {
    super.ngOnInit();
    console.log('[Radio] component:', this.component);
  }  
  
  createCellEditor(): ICellEditorAngularComp {
    throw new Error('Method not implemented.');
  }

  writeValue(value: any): void {
    console.log('[Radio] writeValue(value:', value, ')');
    this.fireChange(this.component.value = value);
  }

  onSelected(event: TFEvent, option: any) {
    console.log('[Radio] onSelected(event:', event, ', option: ', option, ')');
    this.writeValue(option[this.component.model.value]);
  }
  

}
