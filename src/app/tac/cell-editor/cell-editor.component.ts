import { ColDef, IAfterGuiAttachedParams } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, ComponentRef, Host, Inject, OnInit, Optional, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { ColumnService } from 'src/app/service/ColumnService';
import { DataGridComponent } from '../data-grid/data-grid.component';

@Component({
  selector: 'tac-cell-editor',
  templateUrl: './cell-editor.component.html',
  styleUrls: ['./cell-editor.component.css']
})
export class CellEditorComponent  implements ICellEditorAngularComp {

  @ViewChild('container', {read: ViewContainerRef, static: false})
  container!: ViewContainerRef;

  private params!: ICellEditorParams;
  private componentRef!: ComponentRef<any>;
  delegate!: ICellEditorAngularComp;



  constructor(
    @Inject(DataGridComponent) private dataGrid: DataGridComponent,
    private columnService: ColumnService,
    private changeDetectorRef: ChangeDetectorRef) {
  }



  agInit(params: ICellEditorParams): void {
    console.log('[CellEditorComponent] agInit(params:', params, ')');
    this.params = params;
    //this.params.colDef.field;
   // console.log('[tac-cell-editor] columnSerivce:', this.columnService);

  }
  
  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
    console.log('[CellEditorComponent] afterGuiAttached(params:', params, ')');
    if (!this.params.colDef.field) {
      return;
    }
    if (this.componentRef) {
      console.log('[CellEditorComponent] afterGuiAttached... this.componentRef.destroy()');
      this.componentRef.destroy();
    }
    const column = this.columnService.columns[this.params.colDef.field];
    this.componentRef = this.container.createComponent(column.editorFactory);
    this.componentRef.instance.componentByIndex = column.data.components;
    this.componentRef.instance.cellEditor = this;
    this.componentRef.instance.value = this.params.value;


    
    // RowIndexReference support.
    this.dataGrid.component.rowIndex = this.params.rowIndex;

    // console.log(' this.dataGrid.component.row:',  this.dataGrid.component.row);
    // console.log('this.dataGrid: ', this.dataGrid);
    // console.log('this.params: ', this.params);
    // console.log('params: ', params);
    // console.log('containerRef: ', this.container);


    // const column1 = this.dataGrid.component.components.find((column: any) => column.field === this.params.colDef.field);
    // console.log('column:', column1);

  ///  this.componentRef.instance.component = null;

    console.log('[CellEditorComponent] afterGuiAttached... this.componentRef.changeDetectorRef.detectChanges()');
    this.componentRef.changeDetectorRef.detectChanges();
    
    
    if (!this.delegate) {
      return;
    }
    this.delegate.agInit(this.params);
    if (!this.delegate.afterGuiAttached) {
      return;
    }
    this.delegate.afterGuiAttached(params);
  }    

  getValue(): any {
    return !this.delegate ? this.params.value : this.delegate.getValue();
  }

  isCancelBeforeStart(): boolean {
    return !this.delegate || !this.delegate.isCancelBeforeStart ? false : this.delegate.isCancelBeforeStart();
  }

  isCancelAfterEnd(): boolean {
    return !this.delegate || !this.delegate.isCancelAfterEnd ? false : this.delegate.isCancelAfterEnd();
  }

  isPopup(): boolean {
    return !this.delegate || !this.delegate.isPopup ? false : this.delegate.isPopup();
  }
  
}
