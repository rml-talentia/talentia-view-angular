import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Optional } from "ag-grid-community";
import { visit } from "../tac/util";
import { TemplateService } from "./TemplateService";


// interface AppContext {

//   views: { 
//     [viewKey: string]: ViewContext 
//   }

// }

// interface ViewContext {

//   componentByIndex: any[];


// }

interface Form {

  group: FormGroup;
  data: any;
  
}

export interface ViewContext {

  name: string;
  forms: { [key: string]: Form };
  componentByIndex: any[];
  data: any;

}

type ViewContexts = { [key: string]: ViewContext };

interface Open {
  name: string;
  components: any[];
}

interface CreateTemplate {
  context: ViewContext,
  isIgnoredComponent: (component: any) => boolean;
}

@Injectable()
export class ViewService {
    
    private _views: ViewContexts = {};

    constructor(
      ) {}

    get views(): ViewContexts {
      return this._views; // should be immutable, but...
    }

    open(view: Open): ViewContext {
      return this._views[view.name] = {
        name: view.name,
        forms: {},
        componentByIndex: [],
        data: view
      };
    }

    createTemplate(options: CreateTemplate): string {
        const template: string[] = [];
        let componentIndex = -1;
    
        let ignoredComponent: any = null;
        let dataBind: string;
        let form: any;
    
        template.push(`<tac-view>`);
    
        options
          .context
          .data
          .components
          .forEach((component: any) => {
            visit(component, (component: any, parent: any, index: Number, start: Boolean) => {
    
              // Ignore a component when it is rendered in an other view (aside or titlebar-commands)
              if (!!ignoredComponent) {
                if (!start && ignoredComponent === component) {
                  ignoredComponent = null;
                }
                return;
              }
              if (options.isIgnoredComponent(component)) {
                ignoredComponent = component;
                return;
              }
    
              if (start) {
                componentIndex++;
              }
    
    
              const required = !!parent && 'Field' === parent.componentName && parent.required;
    
              const componentBind = `views.${options.context.name}.componentByIndex[${componentIndex}]`;
              const formControlBind = !form || !component.name ? '' : `                
                #inputbase
                #formControl="ngModel"
                [form]="form"
                name="${component.name}"
                [(ngModel)]="${dataBind}.${component.name}"
                ${required ? 'required' : ''}
              `.split(/ *\n */).join(' ');
    
    
              switch (component.componentName) {
                case 'Transaction':
                  template.push(start ? `
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
                       />` : ``);
                       // [formControlName]="${componentBind}.csrfTokenName"
                  break;
                case 'GridLayout':
                  template.push(start ? `<tf-grid-layout>` : '</tf-grid-layout>');
                  break;
                case 'GridRow':
                  template.push(start ? `<tf-grid-row>` : '</tf-grid-row>');
                  break;
                case 'GridColumn':
                  template.push(start ? `<tf-grid-col cols="${component.cols}" margin="md">` : '</tf-grid-col>');
                  break;
                case 'Panel':
                  if (1 === component.components.length 
                    && 0 === component.components[0].components.length) {
                    // Empty panel.
                    // TODO : should be resolved in server side
                    break;
                  }
                  if (component.title && component.title.text !== '&nbsp;') {
                    template.push(start ? `
                    <tf-panel 
                      cols="12">
                      <tf-title
                        [level]="5"
                        [bold]="true"
                        [separator]="true"
                        mode="light"
                        marginDirection="bottom"
                        margin="xl"
                        text="${component.title.text}"></tf-title>
                        <br/>
                    ` : `
                    </tf-panel>
                    `);
                    break;
                  }
                  template.push(start ? `
                  <tf-panel 
                    cols="12" 
                    text="${component.title ? component.title.text : ''}">
                  ` : `
                  </tf-panel>
                  `);
                  break;
                case 'AsidePanel':
                  template.push(start 
                    ? `<div style="margin-right: 1rem;">`
                    : '</div>');
                  break;
                case 'Breadcrumb':
                    break;
                case 'Section':
                  template.push(start 
                    ? `
                    <tf-grid-layout addClasses="tf-width-full">
                      <tf-simple-panel 
                        [cols]="12"
                        addClasses="tac-pixel-perfect">
                        <tf-section  
                          [title]="${componentBind}.title.text" 
                          [titleLevel]="5" 
                          [isCollapse]="true"
                          [dropshadow]="false"
                          layout="advanced">
                        
                    ` : `
                          
                        </tf-section>
                      </tf-simple-panel>
                    </tf-grid-layout>`);
                  break;
                case 'HorizontalLayout':
                  template.push(start 
                    ? `
                      <tf-grid-row horizontalAlignment="end">
                        <tf-grid-col [cols]="4" style="text-align: right;">
                    ` : `
                        </tf-grid-col>    
                      </tf-grid-row>`);
                  break;
                case 'Field':
                  template.push(start ? `
                  <tf-field 
                    addClasses="${!!component.title.text && !!component.title.text.trim() ? 'tf-bold' : ''}"
                    title="${!!component.title.text && !!component.title.text.trim() ? component.title.text : '&nbsp;'}" 
                    cols="${!!component.cols ? component.cols : 4}">
                  ` : `
                  </tf-field>`);
                  break;
                case 'Form':
                    //this.formByIndex.push(component);
                    template.push(start 
                      ? `<form
                          novalidate
                          #form="ngForm">` : '</form>');
                    dataBind = componentBind + '.data';
                    form = !start ? null : component;
                  break;
                case 'Button':
                  //template.push(start ? `<button type="submit" class="button" name="${component.action.name}" value="${component.action.name}"><i class="${component.action.icon}"></i>${component.action.name}</button>` : ``);
                  template.push(start 
                    ? `<tac-button 
                        [data]="${componentBind}">` : `</tac-button>`);
                  break;
                case 'Hidden':
                    template.push(start 
                      ? `<input 
                          type="hidden" 
                          name="${component.name}" 
                          value="${!!component.value ? component.value.value : ''}" 
                           />` : ``);
                    break;
                case 'Text':
                  // template.push(start 
                  //   ? `
                  //   <tf-input 
                  //     ${formControlBind}
                  //     name="${component.name}"
                  //     class="text" 
                  //     typeinput="text" 
                  //     [disabled]="!${componentBind}.access"                    
                  //     >` : `</tf-input>`);
                  template.push(start
                    ? `
                    <tac-text-input
                      ${formControlBind}
                      [data]="${componentBind}">                
                    ` : `
                    </tac-text-input>
                    `);
                  break;
                case 'DatePicker':
                  template.push(start 
                    ? `
                    <tac-datetime-picker
                      ${formControlBind}
                      [data]="${componentBind}">
                    ` : `
                    </tac-datetime-picker>`);
                  break;
                case 'Checkbox':
                  template.push(start 
                    ? `<tf-field cols="2">
                        <tf-checkbox 
                          ${formControlBind}
                          [toggle]="true"
                          title="${component.title.text}">` 
                    : ` </tf-checkbox>
                      </tf-field>`);
                  break;
                case 'Dropdown':
                  template.push(start 
                    ? `
                    <tac-dropdown     
                        ${formControlBind}
                        [data]="${componentBind}"
                        title="${component.title.text}">` 
                    : `
                    </tac-dropdown>`);
                  break;
                case 'Chosen':
                  template.push(start 
                    ? `           
                    <tac-chosen          
                      ${formControlBind}                  
                      [data]="${componentBind}"
                      title="${component.title.text}">
                      <ng-template 
                        #myItemTemplate
                        let-data>
                        {{ data | json }}
                        <tf-h-layout grow="end" spacing="sm">                    
                          <tf-text
                            *ngFor="let cell of data.cells; let isFirst=first"
                            [bold]="isFirst" 
                            [text]="cell" 
                            style=""></tf-text>
                        </tf-h-layout>
                      </ng-template>
                    ` : `
                    </tac-chosen>`);
                  break;
                case 'DataGrid':
                  template.push(start
                    ? `<tac-data-grid [data]="${componentBind}">
                      <ng-template 
                        #customEditor 
                        let-item 
                        let-stopEditing="stopEditing">
                        <tf-input
                            style="width: 100%;"
                            [standalone]="true"
                            (blur)="stopEditing($event)"
                            #input></tf-input>
                      </ng-template>
                    ` 
                    : `</tac-data-grid>`);
                  break;
              }
            });
        });
    
    
        template.push(`</tac-view>`);
    
        return template.join('\n');
      }


      

}