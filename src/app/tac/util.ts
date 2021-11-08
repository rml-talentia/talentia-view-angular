import { Component } from "../service/types";


export function findByComponentType(view: any, componentType: string): any {
    return findInView(view, 
        (component: any, parent: any, index: Number) => componentType === component.componentType ? component : undefined);
}

export function getRoot(component: Component): Component {
    return null === component.parent ? component : getRoot(component.parent);
}
  
export function findInView(view: any, finder: Function) {
    let value;
    visitView(view, (component: any, parent: any, index: Number, start: Boolean) => {
        if (!start) {
        return true;
        }
        return undefined === (value = finder(component, parent, index));
    });
    return value;
}
  
export function visitView(view: any, visitor: Function) {
    const components = view
        .components
        .filter((component: any) => null !== component);
    for (let i = 0; i < components.length; i++) {
        let component = components[i];
        if (false === visit(component, visitor, null, i)) {
        return;
        }
    }
}
  
export function visit(component: any, visitor: Function, parent?: any, index?: Number) {
    if (false === visitor(component, 
        'object' === typeof parent ? parent : null, 
        'number' === typeof index ? index : 0,
        true)) {
        return false;
    }
    for (let i = 0; i < component.components.length; i++) {
        if (false === visit(component.components[i], visitor, component, index)) {
        return false;
        }
    }
    if (false === visitor(component, 
        'object' === typeof parent ? parent : null, 
        'number' === typeof index ? index : 0,
        false)) {
        return false;
        }
        return true;
}