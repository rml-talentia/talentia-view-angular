import { Directive, ElementRef, Input, QueryList, ViewChildren } from "@angular/core";
import { Component } from "src/app/service/types";


@Directive({
    selector: '[tac-base-component]'
})
export abstract class BaseComponent {

    _component!: Component;  

    @Input()
    get component(): Component {
        return this._component;
    }

    set component(component: Component) {
        if (!!this._component) {
            // Will probably never happens.
            this._component._view = null;
        }
        this._component = component;
        if (!!component) {
            component._view = this;
        }
    }

}