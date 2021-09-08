import { ComponentFactory, Injectable } from "@angular/core";


interface Column {

    index: number;
    data: any;
    template: string;
    componentFactory: ComponentFactory<any>;
}

@Injectable()
export class ColumnService {

    
    /**
     * Give access to column infos from cell editor.
     */
    columns: { [field: string]: Column } = {};
}