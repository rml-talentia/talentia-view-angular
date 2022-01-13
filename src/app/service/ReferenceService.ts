import { Injectable } from "@angular/core";
import { findByComponentType, findInView } from "../tac/util";
import { DataGridService } from "./DataGridService";
import { Component, Reference } from "./types";








// TODO : make reference observable ??? example : reset dropdown 
// Seem to be complicating thing....

class ReferenceBase {

}

// Never change ( refernece to components )
class StaticReference extends ReferenceBase {

}

// Change when cache is resetted. ( mostly all kind of references )
class CacheableReference extends ReferenceBase {

}



@Injectable()
export class ReferenceService {

    constructor(
        private dataGridService: DataGridService) {}

    toInstance(data: any, parent?: Component): Component {
        return new Component(this, data, parent || null);
    }

    getValues(component: Component, references: Reference[]): any[] {
        return references.map(reference => this._getValue(component, reference));
    }

    getValueOrDefault(component: Component, reference: Reference, defaultValue: any): any {
      //  console.log('[ReferenceService] getValueOrDefault(...)');
        const value = this._getValue(component, reference);
        return null !== value ? value : defaultValue;
    }

    getValue(component: Component, reference: Reference): any {
        //console.log('[ReferenceService] getValue(component:', component, 'reference:', reference, ')');
        // if ('_value' in reference) {
        //     // Cached.
        //     return reference._value;
        // }
        return this._getValue(component, reference);
    }

    private _getValue(component: Component, reference: Reference): any {
        
        const parentValue = this.getParentValue(component, reference);
        switch (reference.referenceType) {
            case 'ValueReference':
                return reference.value;
            case 'AtKeyReference':
                return null === parentValue ? null : this.asValue(parentValue[reference.key]);
            case 'AtIndexReference':
                return null === parentValue ? null : this.asValue(parentValue[reference.index]);
            case 'DefaultReference':
                return null !== parentValue ? parentValue : this._getValue(component, reference.value);
            case 'SelfReference':
                return component;
            case 'ViewReference':
                return this.getClosest(component, 'View');
            case 'FormReference':
                return this.getClosest(component, 'Form');
            case 'ControlReference':
                return this.asValue(findInView(this.getRoot(component), (component: Component, parent: Component, index: Number) => {
                    // TODO : handle intheritence ???
                    switch (component.componentType) {
                        case 'Input':
                        case 'Checkbox':
                        case 'Chosen':
                        case 'Dropdown':
                        case 'DatePicker':
                            if (reference.name !== component.name) {
                                return;
                            }
                            return component;
                        default:
                            return;
                    }
                }));
            case 'DataGridReference':
            case 'RowsReference':
            case 'RowByIndexReference':
            case 'RowReference':
            case 'RowIndexReference':
                const dataGrid = component.getClosest('DataGrid');
                if (null === dataGrid) {
                    return null;
                }
                switch (reference.referenceType) {
                    case 'DataGridReference':
                        return dataGrid;
                    case 'RowsReference':
                        return this.asValue(this.dataGridService.getRows(dataGrid));
                    case 'RowReference':
                        return this.asValue(this.dataGridService.getRowByIndex(dataGrid, dataGrid.rowIndex));
                    case 'RowIndexReference':
                        return this.asValue(dataGrid.rowIndex);
                    case 'RowByIndexReference':
                        console.log('dataGrid:', dataGrid);
                        return this.asValue(this.dataGridService.getRowByIndex(dataGrid, reference.index));
                }
            case 'DataReference':
                for (let current: (Component | null) = component; null !== current; current = current.parent) {
                    // TODO : test reference rather than actual value ???
                    if ('data' in current && null !== current.data) {
                        return current;
                    }
                }
                return null;
            case 'SessionReference':
                const sessionComponent: any = findInView(this.getRoot(component), (component: Component, parent: Component, index: Number) => {
                    switch (component.componentType) {
                        case 'SessionComponent':
                            return component;
                        default:
                            return;
                    }
                }) || null;
                return null === sessionComponent ? null : sessionComponent.data[reference.key];
            case 'ContextDataReference':
                const contextDataComponent: any = findInView(this.getRoot(component), (component: Component, parent: Component, index: Number) => {
                    switch (component.componentType) {
                        case 'ContextDataComponent':
                            return component;
                        default:
                            return;
                    }
                }) || null;
                return null === contextDataComponent ? null : contextDataComponent.data[reference.key];
            default:
                throw new Error('Unsupported reference. referenceType: ' + reference.referenceType);
        }
    }

    addValue(component: Component, reference: Reference, value: any): void {
        switch (reference.referenceType) {
            case 'RowByIndexReference':
                const dataGrid = component.getClosest('DataGrid');
                if (null === dataGrid) {
                    return;
                }
                this.dataGridService.addRowAtIndex(dataGrid, reference.index, value);
                return;
            default:
                const parentValue = this.getParentValue(component, reference); // an array
                parentValue.splice(reference.index, 0, value);
        }
    }

    spliceValue(component: Component, reference: Reference, start: number, count: number, addedElements: any[]): void {
        switch (reference.referenceType) {
            case 'RowsReference':
                const dataGrid = component.getClosest('DataGrid');
                if (null === dataGrid) {
                    return;
                }
                this.dataGridService.splice(dataGrid, start, count, addedElements);
                return;
        }
    }

    setValue(component: Component, reference: Reference, value: any): void {
        const parentValue = this.getParentValue(component, reference);
        switch (reference.referenceType) {
            case 'ValueReference':
                reference.value = value;
                return;
            case 'AtKeyReference':
                if (null === parentValue) {
                    return;
                }
                parentValue[reference.key] = value;
                return;
            case 'AtIndexReference':
                if (null === parentValue) {
                    return;
                }
                parentValue[reference.key] = value;
                return;
            case 'DefaultReference':
            reference.value = { referenceType: 'ValueReference', parent: null, value: value };  
            //  this.setValue(component, reference.value, value);
                return;
            case 'SessionReference':
                const session = findByComponentType(this.getRoot(component), 'SessionComponent');
                session.data[reference.key] = value;
                return;
            case 'ContextDataReference':
                const contextData = findByComponentType(this.getRoot(component), 'ContextDataComponent');
                contextData.data[reference.key] = value;
                return;
            case 'RowByIndexReference':
                const dataGrid = component.getClosest('DataGrid');
                if (null === dataGrid) {
                    return;
                }
                this.dataGridService.setRowByIndex(dataGrid, reference.index, value);
                return;
            case 'ViewReference':
            case 'FormReference':
            case 'SelfReference':
            case 'ControlReference':
            case 'DataReference':
            default:
                throw new Error('Unsupported reference. referenceType: ' + reference.referenceType);
        }
    }

    private getClosest(component: Component, componentType: string): Component | null {
        if (componentType === component.componentType) {
            return component;
        }
        if (null === component.parent) {
            return null;
        }
        return this.getClosest(component.parent, componentType);
    }

    private getRoot(component: Component): Component {
        return null === component.parent ? component : this.getRoot(component.parent);
    }

    private getParentValue(component: Component, reference: Reference): any {
        return null === reference.parent ? null : this._getValue(component, reference.parent);
    }

    /**
     * @param value any value
     * @returns anything else than undefined
     */
    private asValue(value: any): any {
        return undefined === value ? null : value;
    }

}