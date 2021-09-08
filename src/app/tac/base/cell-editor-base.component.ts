import { IAfterGuiAttachedParams } from "@ag-grid-enterprise/all-modules";
import { Directive, OnInit } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { ICellEditorParams } from "ag-grid-community";


@Directive({
  selector: '[tac-cell-editor-base-component]'
})
export abstract class CellEditorBaseComponent implements ICellEditorAngularComp, OnInit {
      
    private params!: ICellEditorParams;
    cellEditor!: CellEditorBaseComponent;
    delegate!: ICellEditorAngularComp;

    // view column data (component data)
    protected data!: any;

    componentByIndex!: any[];

    constructor() {  
      this.cellEditor = this;
    }

    ngOnInit(): void {
      
      this.componentByIndex = this.data.components;

    }
  
    
    agInit(params: ICellEditorParams): void {
      console.log('agInit this.delegate:' , this.delegate);
      console.log('agInit params:' , params);
      this.params = params; 


      //params.colDef.field;



    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
      console.log('afterGuiAttached this.delegate:' , this.delegate);
      this.delegate.agInit(this.params);
      if (this.delegate.afterGuiAttached) {
        this.delegate.afterGuiAttached(params);
      }
    }    

    getValue(): any {
      return this.delegate.getValue();
    }

    isCancelBeforeStart(): boolean {
      return !this.delegate.isCancelBeforeStart ? false : this.delegate.isCancelBeforeStart();
    }

    isCancelAfterEnd(): boolean {
      return !this.delegate.isCancelAfterEnd ? false : this.delegate.isCancelAfterEnd();
    }

    isPopup(): boolean {
      return !this.delegate.isPopup ? false : this.delegate.isPopup();
    }
 
  }