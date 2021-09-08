import { IAfterGuiAttachedParams } from '@ag-grid-community/core';
import { ChangeDetectorRef, Component, ComponentRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { ColumnService } from 'src/app/service/ColumnService';
import { ViewContainerComponent } from 'src/app/view-container/view-container.component';

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
    private columnService: ColumnService,
    private changeDetectorRef: ChangeDetectorRef) {
  }

  agInit(params: ICellEditorParams): void {
    this.params = params;
    //this.params.colDef.field;
    console.log('[tac-cell-editor] columnSerivce:', this.columnService);

  }
  
  afterGuiAttached(params?: IAfterGuiAttachedParams): void {
    if (!this.params.colDef.field) {
      return;
    }
    const column = this.columnService.columns[this.params.colDef.field];
    this.componentRef = this.container.createComponent(column.componentFactory);
    this.componentRef.instance.componentByIndex = column.data.components;
    this.componentRef.instance.cellEditor = this;
    this.componentRef.instance.value = this.params.value;
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
