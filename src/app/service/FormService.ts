import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TFEvent } from "@talentia/components";
import { AppComponent } from "../app.component";
import { findByComponentName, visitView } from "../tac/util";

let previousIframe: any;


interface SubmitOptions {
    name: string;
    text: string;
}

@Injectable()
export class FormService {

    private appComponent!: AppComponent;

    private form!: FormGroup;

    postConstruct(appComponent: AppComponent): void {
        this.appComponent = appComponent;
    }

    submit(options: SubmitOptions): void {
       // this.appComponent.pageContent.submit();

        //console.log('[FormService] this.appComponent.pageContent.formElements: ', this.appComponent.pageContent.formElements);
       // console.log('[FormService] this.appComponent.pageContent:  ', this.appComponent.pageContent);
       
        // Client side validation, typically required validator.
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            console.log('[FormService] form invalid.');
            return;
        }

        
        this.appComponent.pageLoading = true;

        const action = this.appComponent.pageContent.formByIndex[0].action;
       
  
        const data: { [field: string]: any; } = {};


        const buttonData = { [options.name]: options.text };
        const transactionData = this.appComponent.currentView.transaction;
        const formData = findByComponentName(this.appComponent.currentView, 'Form').data;

        

        // controls['explicitInjectionID'] = new FormControl('');
        // controls['beanName'] = new FormControl('com.lswe.generale.gene.pieceComptableTravail');
        // controls['fkCodeFonction'] = new FormControl('CGSEA');


       // findByComponentName(this.)

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
            if ('componentName' === field) {
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
        // setTimeout(() => {
        //    window.TalentiaViewBridge.submitObject(action, data);
        // });

       console.log('zone:', window.TalentiaViewBridge.getZone());
        
        window.TalentiaViewBridge.getZone().runOutsideAngular(() => {
            var legacyFrame: any = this.appComponent.pageContent.iframe.nativeElement;// window.document.querySelector('iframe#view-iframe');

            if (previousIframe) {
                if (legacyFrame !== previousIframe) {
                    console.log('PREVIOUS FRAME is not the SAME');
                }
                previousIframe = legacyFrame;
            }
    
            //var legacyFrame = document.querySelector('iframe[data-role="page-content-iframe"]');
            var legacyDocument = legacyFrame.contentWindow.document;
    
            var form = legacyDocument.createElement('form');
            form.style.display = 'hidden';
            form.method = 'POST';
            form.action = action + '?sessionId=' + transactionData.currentSessionId;
    
            for (var field in data) {
                var input = legacyDocument.createElement('input');
                input.type = 'hidden';
                input.name = field;
                input.value = data[field];
                form.appendChild(input);
            }
            
    
            legacyDocument.body.appendChild(form);
            console.log('iframes:', window.document.querySelectorAll('iframe'));
            console.log('legacyFrame:', legacyFrame);
            console.log('legacyDocument:', legacyDocument);
            console.log('form:', form);
            form.submit();
        });
       
    }

    setForm(form: FormGroup): void {
        this.form = form;
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