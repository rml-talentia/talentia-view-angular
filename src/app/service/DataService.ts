import { Injectable } from "@angular/core";


/**
 * A centralized access to data.
 * 
 * It is not a repository, it is an exposition of data available from view components.
 */
@Injectable()
export class DataService {

    /**
     * Root of every data.
     */
    data: any = {};

    register(component: any): void {
        this.data[component.name]  = Object.assign({}, undefined === component.data ? {}: component.data);
    }

    unregister(component: any): boolean {
        return delete this.data[component.name];
    }


    // get(bind: any) {
    //     function get(bind: any, context: any) {
    //         if (!!bind.parent) {
    //             context = get(bind.parent, context);
    //         }
    //         switch (bind.bindType) {
    //             case 'FormBind':
    //             case 'FieldBind':
    //                 return context[bind.name];
    //             default:
    //                 throw new Error('Illegal argument. bind:' + JSON.stringify(bind));
    //         }
    //     }        
    //     return get(bind, this.data);
    // }

    // setValue(bind: any, value: any) {
    //     eval(`${this.toExpression(bind)} = '${value}';`);
    // }

    toExpression(bind: any) {
        const expr: string[] = [];
        for (let current = bind; !!current; current = current.parent) {
            switch(bind.bindType) {
                case 'FormBind':
                case 'FieldBind':
                case 'NamedBind':
                    expr.splice(0, 0, current.name);
                    if (!!current.parent) {
                        expr.splice(0, 0, '.');
                    }
                    break;
                case 'IndexedBind':
                    expr.splice(0, 0, '[', current.index, ']');
                    break;
            }
        }
        
        // if (null !== bind.defaultValue) {
        //     expr.push(' || ', '\'', bind.defaultValue, '\'');
        // }
        return expr.join('');
    }
}