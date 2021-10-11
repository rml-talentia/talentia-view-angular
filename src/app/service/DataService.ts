import { Injectable } from "@angular/core";


export interface DataSupplier<T> {

    get name(): any;

    get data(): any;
}

interface GetOptions {
    defaultValue?: any;
}

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

    register(component: DataSupplier<any>): void {
       //this.data[component.name]  = undefined === component.data ? {}: component.data;//Object.assign({}, undefined === component.data ? {}: component.data);
    }

    unregister(component: any): boolean {
        //return delete this.data[component.name];
        return true;
    }


    get(bind: any, options?: GetOptions) {
        function get(bind: any, context: any) {
            if (undefined === context || null === context) {
                return null;
            }
            if (!!bind.parent) {
                context = get(bind.parent, context);
            }
            if (!bind.bindType) {
                return bind.value; // Constant, it is a Value ... bindType should be valueType
            }
            switch (bind.bindType) {
                case 'FormBind':
                case 'FieldBind':
                case 'NamedBind':
                    return context[bind.name];
                case 'IndexedBind':
                    return context[bind.index];
                default:
                    throw new Error('Illegal argument. bind:' + JSON.stringify(bind));
            }
        }        

        const value = get(bind, this.data);
        if (undefined !== value && null !== value) {
            return value;
        }
        if (!!options && 'defaultValue' in options) {
            return options.defaultValue;
        }
        return null;
    }

    set(bind: any, value: any) {
        const context = this.get(bind.parent);
        if (undefined === context || null === context) {
            return null;
        }
        switch (bind.bindType) {
            case 'FormBind':
            case 'FieldBind':
            case 'NamedBind':
                context[bind.name] = value;
                return;
            case 'IndexedBind':
                context[bind.index] = value;
                return;
            default:
                throw new Error('Illegal argument. bind:' + JSON.stringify(bind));
        }
    }

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