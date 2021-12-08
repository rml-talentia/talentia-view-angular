
import { AfterContentChecked, AfterViewChecked, Directive, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ControlValueAccessor, FormGroup } from "@angular/forms";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { CellEditorComponent } from "../cell-editor/cell-editor.component";
import { CellRendererComponent } from "../cell-renderer/cell-renderer.component";
import { BaseComponent } from "./component-base.component";


class Step {

}

class InputOn extends Step {
}


@Directive({
    selector: '[tac-input-base-component]'
})
export abstract class InputBaseComponent extends BaseComponent implements OnInit, ControlValueAccessor {
  
    @Input()
    form!: FormGroup;
    @Input()
    name!: string;
    @Input()
    title!: string;
    @Input()
    cellEditor!: CellEditorComponent;
    @Input()
    cellRenderer!: CellRendererComponent;
    
    protected onchange: any;
    protected ontouched: any;
    
    abstract createCellEditor(): ICellEditorAngularComp;
    abstract writeValue(value: any): void;
    
    ngOnInit(): void {
        // Cell editor support.
        if (!!this.cellEditor) {
            this.cellEditor.delegate = this.createCellEditor();
        }        
    }

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

    protected isInCellEditor(): boolean {
        return null !== this.component.getClosest('DataGrid');
    }

    registerOnChange(onchange: any): void {
        this.onchange = onchange;
    }

    registerOnTouched(ontouched: any): void {
       this.ontouched = ontouched;
    }
}