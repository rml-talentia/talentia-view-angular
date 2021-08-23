import { Injectable } from "@angular/core";
import { visitView } from "../tac/util";


@Injectable()
export class FormService {

    createForm(view: any): any {

        
        const root = { };
        let stack: any[] = [root];

        visitView(view, (component: any, parent: any, index: Number, start: Boolean) => {
            const current = stack[stack.length - 1];

            switch (component.componentName) {
                case 'Form':
                    if (start) {
                        stack.push({ });
                    } else {
                        stack.splice(0, stack.length - 1);
                    }
                    break;
                case 'Transaction':
                    current.sessionId = component.currentSessionId;
                    current._currentSessionId = component.currentSessionId;
                    current._currentTransaction = component.currentTransaction;
                    current._currentOption = component.currentOption;
                    current._currentPath = component.currentPath;
                    current[component.csrfTokenName] = component.csrfTokenValue;
                    break;
                case 'Hidden':
                case 'Text':
                case 'Dropdown':
                case 'Chosen':
                    current[component.name] = null !== component.value ? component.value.value : '';
                    break;
                case 'Checkbox':
                    current[component.name] = null !== component.value ? component.value.value : false;
                    break;
            }
        });

    }

}