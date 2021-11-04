import { ReferenceService } from "./ReferenceService";


export type Action = {
    actionType: string,
    href: string,
    parameters: { [key: string]: any } 
}

export type Event = {
    componentType: string,
    actions: Action[]
}

export type Reference = { 
    referenceType: string,
    parent: Reference | null, 
    [key: string]: any ,

};

export class Component {

    [key: string]: any;
    public parent: Component | null = null;
   // public components: Component[] = [];
   // public events: Event[] = [];
   // public actions: Action[] = [];
   // public componentType: string;
    private _options: any;
    private _data: any;
    private _bindings: any;

    constructor(
        private _referenceService: ReferenceService,
        options: any,
        parent: Component | null) {
        this.componentType = options.componentType;
        this._options = options; // TODO : deepFreeze ? https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
        this.parent = parent;

        
        this.populate();
        

        // this.populateComponents();
        // this.populateEvents();
        // this.populateActions();
        // this.populateReferences();
        this.defineProperties();
    }

    // static isComponent(value: any): boolean {
    //     return null !== value 
    //         && 'object' === typeof value 
    //         && 'componentType' in value 
    //         && 'bindings' in value;
    // }

    static isBindable(value: any): boolean {
        return null !== value 
            && 'object' === typeof value
            && 'bindings' in value
            && null != value.bindings
            && 'Bindings' === value.bindings.bindingsType;
    }

    private populate() {
        this._data = {};
        for (const k in this._options) {
            if ('bindings' === k) {
                continue;
            }
            this._data[k] = this.populateValue(this._options[k]);
        }
        this._bindings = { references: {} };
        for (const k in this._options.bindings.references) {
            this._bindings.references[k] = this.populateValue(this._options.bindings.references[k]);
        }
    }

    private populateValue(value: any) {
        if (Component.isBindable(value)) {
            return new Component(this._referenceService, value, this);
        }
        if (Array.isArray(value)) {
            const result: any[] = [];
            for (let i = 0; i < value.length; i++) {
                result.push(this.populateValue(value[i]));
            }
            return result;
        }
        if (null !== value && 'object' === typeof value) {
            const result: any = {};
            for (const k in value) {
                result[k] = this.populateValue(value[k]);
            }
            return result;
        }
        return value;
    }

    private defineProperties() {
        for (const k in this._bindings.references) {
            const reference = this._bindings.references[k];
            // console.log('reference:', reference);
            // TODO : handle null reference ??? or prevent null in getBindings().setReference from server side ?
            if (Array.isArray(reference)) {
                this.defineReferenceArrayProperty(k, reference);
            } else {
                this.defineReferenceProperty(k, reference);
            }
        }
        for (const k in this._data) {
            if (k in this._options.bindings.references) {
                continue;
            }
            if (k === 'bindings') {
                continue;
            }
            this.defineDataProperty(k);
        }
    }

    private defineDataProperty(key: string) {
        Object.defineProperty(this, key, {
            enumerable: true,
            get: () => this._data[key],
            set: (value: any) => this._data[key] = value
        });
    }

    private defineReferenceArrayProperty(key: string, references: Reference[]) {
        Object.defineProperty(this, key, {
            enumerable: true,
            get: () => this._referenceService.getValues(this, references)
        });
    }

    private defineReferenceProperty(key: string, reference: Reference) {

        // const value = this.referenceService.getValue(this, reference);
        // if (null !== value && 'object' === typeof value && 'componentType' in value && 'bindings' in value) {
        //     this.referenceService.setValue(this, reference, new Component(this.referenceService, value, this));
        // }

        Object.defineProperty(this, key, {
            enumerable: true,
            get: () => this._referenceService.getValue(this, reference),
            set: (value: any) => this._referenceService.setValue(this, reference, value)
        });
    }

    getClosest(componentType: string): Component | null {
        if (this.componentType === componentType) {
            return this;
        }
        if (null === this.parent) {
            return null;
        }
        return this.parent.getClosest(componentType);
    }

    toObject() {
        //console.log('[Component] toObject() this:', this);
        const object: any = {};
        for (const key in this) {
            switch (key) {
                case 'modelType':
                case 'componentType':
                case '_referenceService':
                case '_data':
                case '_bindings':
                case '_options':
                case 'components':
                case 'events':
                case 'actions':
                case 'parent':
                   // case 'parameters':
                    continue;
            }
            let value: any = this[key];
            if (value instanceof Component) {
                value = value.toObject();
            }
            if (Array.isArray(value)) {
                value = value.map(item => {
                    if (item instanceof Component) {
                        return item.toObject();
                    }
                    return item;
                });
            }
            object[key] = value;
        }
        return object;
    }

}