import { ComponentFactory, Injectable } from "@angular/core";


interface Column {

    index: number;
    data: any;
    editorTemplate: string;
    rendererTemplate: string;
    editorFactory: ComponentFactory<any>;
    rendererFactory: ComponentFactory<any>;
}

@Injectable()
export class ColumnService {

    
    /**
     * Give access to column infos from cell editor.
     */
    columns: { [field: string]: Column } = {};
}