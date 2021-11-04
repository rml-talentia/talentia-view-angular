import { Injectable } from "@angular/core";
import { AjaxService } from "./AjaxService";
import { Action, Component, Event } from "./types";




@Injectable()
export class EventService {

    constructor(private ajaxService: AjaxService) {
    }

    doEvent(component: Component, eventType: string) {
        console.log('[EventService] doEvent(component:', component, 'eventType:', eventType, ')');
        component
            .events
            .filter((event: Component) => event.componentType === eventType)
            .forEach((event: Component) => {
                event
                    .actions
                    .forEach((action: Component) => {
                        switch(action.componentType) {
                            case 'Ajax':
                                this.ajaxService.doAjax(component, action);
                                break;
                            case 'TableChange': // Legacy ui:tableAction
                                this.ajaxService.doTableChange(component, action);
                                break;
                        }
                    });
            });
    }

}