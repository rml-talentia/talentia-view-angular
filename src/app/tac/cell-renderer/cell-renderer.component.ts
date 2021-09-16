
import { ChangeDetectionStrategy, Component, ComponentRef, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ColumnService } from 'src/app/service/ColumnService';

@Component({
  selector: 'tac-cell-renderer',
  templateUrl: './cell-renderer.component.html',
  styleUrls: ['./cell-renderer.component.css']
})
export class CellRendererComponent implements ICellRendererComp  {

  @ViewChild('container', { static: true, read: ViewContainerRef})
  container!: ViewContainerRef;
  @ViewChild("element", { static: true, read: ElementRef })
  elementRef!: ElementRef<any>;

  private params!: ICellRendererParams;
  private componentRef!: ComponentRef<any>;
  delegate!: ICellRendererComp;

  constructor(
    private columnService: ColumnService) {}

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.refresh(params);    
  }

  refresh(params: ICellRendererParams): boolean { 
    this.params = params;
    if (!this.params.colDef || !this.params.colDef.field) {
      return true;
    }
    if (!this.container) {
      return true;
    }
    const column = this.columnService.columns[this.params.colDef.field];
    if (!this.componentRef) {
      this.componentRef = this.container.createComponent(column.rendererFactory);
    }
    this.componentRef.instance.componentByIndex = column.data.components;
    this.componentRef.instance.cellRenderer = this;
    this.componentRef.instance.value = this.params.value;
    return true;
  }

  getGui(): HTMLElement {
    return this.elementRef.nativeElement;
  }

}
