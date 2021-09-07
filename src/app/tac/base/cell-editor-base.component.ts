import { IAfterGuiAttachedParams } from "@ag-grid-enterprise/all-modules";
import { Directive } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { ICellEditorParams } from "ag-grid-community";


@Directive({
  selector: '[tac-cell-editor-base-component]'
})
export abstract class CellEditorBaseComponent implements ICellEditorAngularComp {
      
    private params!: ICellEditorParams;
    parent!: any;
    message: string = 'HELLO IN ANTI PATTERN WORLD';

    delegate!: ICellEditorAngularComp;

    constructor() {
      this.parent = this;       
      
    }

    // Delegate agGrid cell editor implementation to this instance.
    // By this way, the implementation can be passed by editor component itself.
    cellEditor: ICellEditorAngularComp = <ICellEditorAngularComp> {

      agInit: (params: ICellEditorParams) => {
        console.log('agInit this.cellEditor:' , this.cellEditor);
        this.params = params; 
        // if (!this.cellEditor) {
        //   return;
        // }
        // this.cellEditor.agInit(this.params);
      },

      afterGuiAttached: (params?: IAfterGuiAttachedParams) => {
      },

      getValue: () => {
        return this.params.value;
      },

      isCancelBeforeStart: () => {
        return false;
      },

      isCancelAfterEnd: () => {
        return false;
      },

      isPopup: () => {
        return false;
      }
    };
    
    agInit(params: ICellEditorParams): void {
      console.log('agInit this.cellEditor:' , this.cellEditor);
      this.params = params; 
    }

    afterGuiAttached(params?: IAfterGuiAttachedParams): void {
      console.log('afterGuiAttached this.cellEditor:' , this.cellEditor);
      this.cellEditor.agInit(this.params);
      if (this.cellEditor.afterGuiAttached) {
        this.cellEditor.afterGuiAttached(params);
      }
    }    

    getValue() {
      return this.cellEditor.getValue();
    }

    isCancelBeforeStart(): boolean {
      return !this.cellEditor.isCancelBeforeStart ? false : this.cellEditor.isCancelBeforeStart();
    }

    isCancelAfterEnd(): boolean {
      return !this.cellEditor.isCancelAfterEnd ? false : this.cellEditor.isCancelAfterEnd();
    }

    isPopup(): boolean {
      return !this.cellEditor.isPopup ? false : this.cellEditor.isPopup();
    }
 
  }