import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TFEvent } from "@talentia/components";
import { AppComponent } from "../app.component";
import { findByComponentType, visitView } from "../tac/util";
import { DataService } from "./DataService";


interface Form {

    group: FormGroup;
    data: any;
    
}

interface Submit {
    
    form: string;
    button: {
        data: any;
    };

}



@Injectable()
export class FormService {

    private appComponent!: AppComponent;
    private forms: { [name: string]: Form } = {};

    constructor(
        private dataService: DataService
    ) {}

    postConstruct(appComponent: AppComponent): void {
        this.appComponent = appComponent;
    }

    register(form: Form): void {
        console.log('[FormService] register(form:', form, ')');
        this.forms[form.data.name] = form;
    } 

    unregister(form: Form): boolean {
        console.log('[FormService] unregister(form:', form, ')');
        return delete this.forms[form.data.name];
    }

    submit(options: Submit): void {
        console.log('[FormService] submit(options: ', options, ')');

        // Client-side validation.
        const form = this.forms[options.form];
        if (options.button.data.action.validation) {
            form.group.markAllAsTouched();
            if (form.group.invalid) {
                console.log('[FormService] form invalid.');
                return;
            }
        }
        
        this.appComponent.pageLoading = true;

       
  
        const data: { [field: string]: any; } = {};
        const buttonData = { [options.button.data.action.name]: !options.button.data.action.title ? '' : options.button.data.action.title.text };
        const transactionData = this.appComponent.currentView.transaction;
        const formData = this.dataService.data[options.form]; //findByComponentType(this.appComponent.currentView, 'Form').data;


        for (let field in buttonData) {
            data[field] = buttonData[field];
        }

        for (let field in transactionData) {
            if ('components' === field) {
                continue;
            }
            if ('show' === field) {
                continue;
            }
            if ('id' === field) {
                continue;
            }
            if ('componentType' === field) {
                continue;
            }
            let value = transactionData[field];
            data[field] = value;
        }

        for (let field in formData) {
            let value = formData[field];
            if ('boolean' === typeof value) {
              value = value ? 'on' : 'off';
            }
            data[field] = value;
        }

        data[transactionData.csrfTokenName] = transactionData.csrfTokenValue;
        
        console.log('[FormService] data:', data);
        window.TalentiaViewBridge.submitObject(form.data.action, data);
       
    }



/*
<input 
    type="hidden" 
    name="sessionId" />
<input 
    type="hidden" 
    name="_currentSessionId" />
<input 
    type="hidden" 
    name="_currentTransaction" />
<input 
    type="hidden" 
    name="_currentOption" />
<input 
    type="hidden" 
    name="_currentPath" />
<input 
    type="hidden" 
    />
*/



    
        

        // controls['explicitInjectionID'] = new FormControl('');
        // controls['beanName'] = new FormControl('com.lswe.generale.gene.pieceComptableTravail');
        // controls['fkCodeFonction'] = new FormControl('CGSEA');

    // setForm(form: FormGroup): void {
    //     this.form = form;
    // }

   /*  
   createForm(view: any): any {

        
        const root = { };
        let stack: any[] = [root];

        visitView(view, (component: any, parent: any, index: Number, start: Boolean) => {
            const current = stack[stack.length - 1];

            switch (component.componentType) {
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