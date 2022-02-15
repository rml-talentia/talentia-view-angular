import { Directive, ElementRef, Input, QueryList, ViewChildren } from "@angular/core";
import { Bindable } from "src/app/service/types";


@Directive({
    selector: '[tac-base-component]'
})
export abstract class BaseComponent {

    _component!: Bindable;  

    @Input()
    get component(): Bindable {
        return this._component;
    }

    set component(component: Bindable) {
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