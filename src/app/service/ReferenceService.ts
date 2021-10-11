import { Injectable } from "@angular/core";
import { findInView, visit } from "../tac/util";



type Event = {

    parameters: any[];

};


export class Component {

    [key: string]: any;
    public parent: Component | null = null;
    public components: Component[] = [];
    public events: Event[] = [];
    public componentType: string;
    private _data: any;

    constructor(
        private referenceService: ReferenceService,
        data: any,
        parent: Component | null) {
        this.componentType = data.componentType;
        this.events = data.events;
        this._data = Object.freeze(data); // TODO : deepFreeze ? https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
        this.parent = parent;
        
        this.defineProperties();
        this.populateComponents();
    }

    private populateComponents() {
        this.components = this
            ._data
            .components
            .map((data: any) => new Component(this.referenceService, data, this));
        // this.events = !('events' in this._data) ? [] : this
        //     ._data
        //     .events
        //     .map((data: any) => new Component(this.referenceService, data, this));
    }

    private defineProperties() {
        for (const key in this._data.bindings.references) {
            const reference = this._data.bindings.references[key];
            // console.log('reference:', reference);
            // TODO : handle null reference ??? or prevent null in getBindings().setReference from server side ?
            if (Array.isArray(reference)) {
                this.defineArrayProperty(key, reference);
            } else {
                this.defineProperty(key, reference);
            }
        }
    }

    private defineArrayProperty(key: string, references: Reference[]) {
        Object.defineProperty(this, key, {
            enumerable: true,
            get: () => {
                
                return this.referenceService.getValues(this, references);
            }
        });
    }

    private defineProperty(key: string, reference: Reference) {

        const value = this.referenceService.getValue(this, reference);
        if (null !== value && 'object' === typeof value && 'componentType' in value && 'bindings' in value) {
            this.referenceService.setValue(this, reference, new Component(this.referenceService, value, this));
        }

        Object.defineProperty(this, key, {
            enumerable: true,
            get: () => {
      
                return this.referenceService.getValue(this, reference);
            },
            set: (value: any) => {
                this.referenceService.setValue(this, reference, value);
            }
        });
    }

    toObject() {
        const object: any = {};
        console.log(this);
        for (const key in this) {
            switch (key) {
                case 'componentType':
                    // Prevent  Unrecognized field "componentType" (jackson without ignore unknow properties)
                case 'referenceService':
                case 'components':
                case 'events':
                case 'parent':
                case '_data':
                   // case 'parameters':
                    continue;
                default:
                    console.log('key:', key);
                    object[key] = this[key];
            }
        }
        return object;
        // return {
        //     componentType: this.componentType,
        //     ...this
        //         ._data
        //         .bindings
        //         .references
        //         .map((reference: Reference) => this.referenceService.getValue(this, reference))
        // };
    }

}

type Reference = { 
    referenceType: string,
    parent: Reference, 
    [key: string]: any 
};

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

    private controlByName: { [name: string]: Component | null } = {};

    toInstance(data: any, parent?: Component): Component {
        return new Component(this, data, parent || null);
    }

    getValues(component: Component, references: Reference[]): any[] {
        return references.map(reference => this.getValue(component, reference));
    }

    getValueOrDefault(component: Component, reference: Reference, defaultValue: any): any {
        const value = this.getValue(component, reference);
        return null !== value ? value : defaultValue;
    }

    getValue(component: Component, reference: Reference): any {
        const parentValue = this.getParentValue(component, reference);
        switch (reference.referenceType) {
            case 'Value':
                return reference.value;
            case 'AtKeyReference':
                return null === parentValue ? null : this.asValue(parentValue[reference.key]);
            case 'AtIndexReference':
                return null === parentValue ? null : this.asValue(parentValue[reference.index]);
            case 'DefaultReference':
                throw new Error('');
            case 'SelfReference':
                return component;
            case 'ViewReference':
                return this.getClosest(component, 'View');
            case 'FormReference':
                return this.getClosest(component, 'Form');
            case 'ControlReference':
                // if (reference.name in this.controlByName) {
                //     return this.controlByName[reference.name];
                // }
                return this.controlByName[reference.name] = findInView(this.getRoot(component), (component: Component, parent: Component, index: Number) => {
                    switch (component.componentType) {
                        case 'Input':
                        case 'Checkbox':
                        case 'Dropdown':
                        case 'DatePicker':
                            if (reference.name !== component.name) {
                                return;
                            }
                            return component;
                        default:
                            return;
                    }
                }) || null;
            case 'DataReference':
                for (let current: (Component | null) = component; null !== current; current = current.parent) {
                    // TODO : test reference rather than actual value ???
                    if ('data' in current && null !== current.data) {
                        return current;
                    }
                }
                return null;
            case 'SessionReference':
                console.log('SessionReference component: ', component, ' root: ', this.getRoot(component));
                const sessionComponent: any = findInView(this.getRoot(component), (component: Component, parent: Component, index: Number) => {
                    switch (component.componentType) {
                        case 'SessionComponent':
                            return component;
                        default:
                            return;
                    }
                }) || null;
                console.log('sessionComponent: ', sessionComponent);
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

    setValue(component: Component, reference: Reference, value: any): void {
        const parentValue = this.getParentValue(component, reference);
        switch (reference.referenceType) {
            case 'Value':
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
        return null === reference.parent ? null : this.getValue(component, reference.parent);
    }

    /**
     * @param value any value
     * @returns anything else than undefined
     */
    private asValue(value: any): any {
        return undefined === value ? null : value;
    }

}