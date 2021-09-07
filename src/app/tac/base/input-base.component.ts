
import { IAfterGuiAttachedParams } from "@ag-grid-community/core";
import { Directive, Input, OnInit } from "@angular/core";
import { ControlValueAccessor, FormGroup } from "@angular/forms";
import { ICellEditorAngularComp } from "ag-grid-angular";
import { CellEditorBaseComponent } from "./cell-editor-base.component";


@Directive({
    selector: '[tac-input-base-component]'
})
export abstract class InputBaseComponent implements OnInit, ControlValueAccessor {


    @Input()
    form!: FormGroup;
    @Input()
    name!: string;
    @Input()
    data!: any;    
    @Input()
    title!: string;
    @Input()
    cellEditor!: CellEditorBaseComponent;

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

    abstract createCellEditor(): ICellEditorAngularComp;

    abstract writeValue(value: any): void;

    registerOnChange(onchange: any): void {
        this.onchange = onchange;
    }

    registerOnTouched(ontouched: any): void {
       this.ontouched = ontouched;
    }
}