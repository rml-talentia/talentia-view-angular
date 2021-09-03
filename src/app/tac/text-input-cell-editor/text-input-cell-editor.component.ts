import { ICellEditorAngularComp } from '@ag-grid-community/angular';
import { ICellEditorParams } from '@ag-grid-community/core';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { TFEvent } from '@talentia/components';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
  selector: 'tac-text-input-cell-editor',
  templateUrl: './text-input-cell-editor.component.html',
  styleUrls: ['./text-input-cell-editor.component.css']
})
export class TextInputCellEditor implements AfterViewInit, ICellEditorAngularComp {


  private params!: ICellEditorParams;

  @ViewChild('input', { read: TextInputComponent })
  input!: TextInputComponent;

  value!: string;
  

  data: any = {
    name: 'editor',
    access: true
  };

  constructor() { }


  ngAfterViewInit(): void {
    
  }

  agInit(params: ICellEditorParams): void {
    this.value = params.value;
    this.params = params;
    
    //this.params.colDef.field
    console.log('this.params:', this.params);
  }


  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    this.input.focus();
  }


  getValue() {
    return this.value;
  }

  isCancelBeforeStart(): boolean {
    return false;
  }

  isCancelAfterEnd(): boolean {
    return false;
  }

  isPopup(): boolean {
    return false;
  }

  onBlur(event: TFEvent) {
    console.log('[text-input-cell-editor] onBlur( event:', event, ' value:', this.value, ')');
      // if (!!this.params) {
      //     setTimeout(() => 
      //     this.params.stopEditing());
      // }
  }
}
