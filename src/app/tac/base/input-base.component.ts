
import { IAfterGuiAttachedParams } from "@ag-grid-community/core";
import { AfterContentChecked, AfterViewChecked, Directive, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, FormGroup } from "@angular/forms";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { DataSupplier } from "src/app/service/DataService";
import { CellEditorComponent } from "../cell-editor/cell-editor.component";
import { CellRendererComponent } from "../cell-renderer/cell-renderer.component";


@Directive({
    selector: '[tac-input-base-component]'
})
export abstract class InputBaseComponent implements OnInit, ControlValueAccessor,  AfterViewChecked, AfterContentChecked, OnChanges {
  
    @Input()
    form!: FormGroup;
    @Input()
    name!: string;
    @Input()
    component!: any;    
    @Input()
    title!: string;
    @Input()
    cellEditor!: CellEditorComponent;
    @Input()
    cellRenderer!: CellRendererComponent;
    
    
    get lastUpdate() {
        return new Date().getTime();
      }

    protected onchange: any;
    protected ontouched: any;

    protected fireChange(newValue: any): void {
        if (!!this.onchange) {
            this.onchange(newValue);
        }
    }

    protected fireTouched(): void {
        if (!!this.ontouched) {
            this.ontouched();
        }
    }

    ngOnInit(): void {
        if (this.cellEditor) {
            this.cellEditor.delegate = this.createCellEditor();
        }        
    }

    protected isInCellEditor(): boolean {
        return null !== this.component.getClosest('DataGrid');
    }


    ngAfterViewChecked(): void {
   //     if (undefined === this.changeCount) this.changeCount = 0;

   }
   ngAfterContentChecked(): void {
   
   }

   ngOnChanges(changes: SimpleChanges): void {
    
   }

    abstract createCellEditor(): ICellEditorAngularComp;

    // createData(): any {
    //     return {};
    // }

    // getName(): string {
    //     return this.component.name || null;
    // }
    
    // private _data: any;

    // getData() {
    //     return undefined !== this._data ? this._data : (this._data = this.createData()); 
    // }

    abstract writeValue(value: any): void;

    registerOnChange(onchange: any): void {
        this.onchange = onchange;
    }

    registerOnTouched(ontouched: any): void {
       this.ontouched = ontouched;
    }
}