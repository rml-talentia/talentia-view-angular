import { IAfterGuiAttachedParams } from '@ag-grid-community/core';
import { Component, forwardRef, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { DataService } from 'src/app/service/DataService';
import { InputBaseComponent } from '../base/input-base.component';

@Component({
  selector: 'tac-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => CheckboxComponent)
  }]
})
export class CheckboxComponent extends InputBaseComponent {

  @Input()
  value!: boolean;
  
  data: any = {
    show: true,
    access: true
  };


  constructor(
    private dataService: DataService
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();

    this.data = {
      show: this.component.show,
      access: this.component.access
    };
    this.dataService.register(this);

  }
  
  get toggle(): boolean {
    return !this.cellEditor && !this.cellRenderer;
  }

  createCellEditor(): ICellEditorAngularComp {
    return {       
        
      agInit: (params) => {
        this.value = params.value;
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => { 
      },

      getValue: () => {
        return this.value;
      }

    };
  }


  writeValue(value: any): void {
    this.fireChange(this.value = value);
  }

}
