import { Injectable } from "@angular/core";
import { AppComponent } from "../app.component";
import { visitView } from "../tac/util";


@Injectable()
export class FormService {

    private appComponent!: AppComponent;

    postConstruct(appComponent: AppComponent): void {
        this.appComponent = appComponent;
    }

    submit(): void {
       // this.appComponent.pageContent.submit();

        //console.log('[FormService] this.appComponent.pageContent.formElements: ', this.appComponent.pageContent.formElements);
        console.log('[FormService] this.appComponent.pageContent:  ', this.appComponent.pageContent);
       
    }



   /*  
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

    } */

}