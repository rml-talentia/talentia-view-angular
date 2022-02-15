import { Injectable } from "@angular/core";
import { AjaxService } from "./AjaxService";
import { Action, Bindable, Event } from "./types";




@Injectable()
export class EventService {

    constructor(private ajaxService: AjaxService) {
    }

    doEvent(component: Bindable, eventType: string) {
        console.log('[EventService] doEvent(component:', component, 'eventType:', eventType, ')');
        component
            .events
            .filter((event: Bindable) => event.componentType === eventType)
            .forEach((event: Bindable) => {
                event
                    .actions
                    .forEach((action: Bindable) => {
                        switch(action.componentType) {
                            case 'Ajax':
                                this.ajaxService.doAjax(component, action);
                                break;
                            case 'TableChange': // Legacy ui:tableAction
                                this.ajaxService.doTableAjax(component, action);
                                break;
                        }
                    });
            });
    }

}