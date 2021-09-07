import { Component, OnInit } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { ViewContainerComponent } from 'src/app/view-container/view-container.component';

@Component({
  selector: 'tac-cell-editor',
  templateUrl: './cell-editor.component.html',
  styleUrls: ['./cell-editor.component.css']
})
export class CellEditorComponent extends ViewContainerComponent implements ICellEditorAngularComp {

  agInit(params: ICellEditorParams): void {
    throw new Error('Method not implemented.');
  }

  
  getValue() {
    throw new Error('Method not implemented.');
  }


  
}
