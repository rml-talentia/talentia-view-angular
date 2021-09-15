
import { ComponentFactory, ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { visit } from "../tac/util";
import { DataService } from "./DataService";
import { CompilerService } from "./CompilerService";




@Injectable()
export class ViewService {    
 
    constructor(
      private compilerService: CompilerService,
      private dataService: DataService) {}

    createAndCompileTemplate(options: CreateAndCompileTemplate): Observable<ComponentRef<any>> {
      const template = this.createTemplate(options);
      const componentByIndex = this.createComponentByIndex(options);
      return this
        .compilerService
        .getComponentFactory(template)
        .pipe(map((componentFactory: ComponentFactory<any>) => {
          const componentRef = options.container.createComponent(componentFactory);
          componentRef.instance.componentByIndex = componentByIndex;
          //componentRef.instance.views = this.views;
          componentRef.instance.data = this.dataService.data;
         // componentRef.changeDetectorRef.detectChanges();
          return componentRef;
        }));
    }

    createTemplate(options: CreateTemplate): string {
      const template: string[] = [];

      let componentIndex = -1;
  
      let ignoredComponent: any = null;
      let formGroupBind: string | null = null;
      let formBind: string | null = null;
    
      options
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
            if (!!options.isIgnoredComponent && options.isIgnoredComponent(component)) {
              ignoredComponent = component;
              return;
            }
  
            if (start) {
              componentIndex++;
            }
    
            const required = !!parent && 'Field' === parent.componentName && parent.required;
            const componentBind = `componentByIndex[${componentIndex}]`;
            const formControlBind = !formGroupBind || !component.name ? '' : `                
              #inputbase
              #formControl="ngModel"
              [form]="${formGroupBind}"
              name="${component.name}"
              [(ngModel)]="${!component.value ? '' : 'data.' + this.dataService.toExpression(component.value)}"
              ${!required ? '' : 'required'}
            `;  
            const cellEditorControlBind = !options.cellEditor ? '' : `
              [cellEditor]="cellEditor"
              [(ngModel)]="value"
            `;
            const cellRendererControlBind = !options.cellRenderer ? '' : `
              [cellRenderer]="cellRenderer"
              [(ngModel)]="value"
            `;

            const controlBind = [
              formControlBind,
              cellEditorControlBind,
              cellRendererControlBind]
              .join('')
              .split(/ *\n */)
              .join(' ');

            if (!!options.cellRenderer) { 
              switch(component.componentName) {
                case 'Checkbox':
                  template.push(start ? `
                    <tac-checkbox 
                        ${controlBind}
                        [component]="${componentBind}"
                        title="">
                    ` : ` 
                    </tac-checkbox>`);
                  break;
                default:
                  template.push(start ? `
                    <tac-text
                        [component]="${componentBind}"
                        [value]="value">
                    ` : ` 
                    </tac-text>`);
              }
              return;
            }
  
            switch (component.componentName) {
              case 'View':
                template.push(start ? `
                <tac-view>
                ` : `
                </tac-view>`);
                break;
              case 'Transaction':
                break;
              case 'Form':
                  formGroupBind = !start ? null : `form`;// !start ? null : `form${++formIndex}`;
                  formBind = !start ? null : componentBind;
                  template.push(start 
                    ? `
                    <form
                      novalidate
                      #${formGroupBind}="ngForm">
                      <tac-transaction 
                        [formData]="${formBind}"
                        [form]="${formGroupBind}.form"></tac-transaction>
                    ` : `
                    </form>`);
                break;
              case 'Button':
                template.push(start 
                  ? `<tac-button 
                      [component]="${componentBind}"
                      [formName]="${componentBind}.action.form">` : `</tac-button>`);
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
  
              case 'Hidden':
                  template.push(start 
                    ? `<input 
                        type="hidden" 
                        name="${component.name}" 
                        value="${!!component.value ? component.value.value : ''}" 
                         />` : ``);
                  break;
              case 'Text':
                template.push(start
                  ? `
                  <tac-text-input
                    ${controlBind}
                    [component]="${componentBind}">                
                  ` : `
                  </tac-text-input>
                  `);
                break;
              case 'DatePicker':
                template.push(start 
                  ? `
                  <tac-datetime-picker
                    ${controlBind}
                    [component]="${componentBind}">
                  ` : `
                  </tac-datetime-picker>`);
                break;
              case 'Checkbox':
                if (options.cellEditor) {
                  template.push(start ? `
                    <tac-checkbox 
                        ${controlBind}
                        [component]="${componentBind}"
                        title="">
                    ` : ` 
                    </tac-checkbox>`);
                } else {
                  template.push(start 
                    ? `<tf-field cols="2" title="&nbsp;">
                        <tac-checkbox 
                          ${controlBind}
                          [component]="${componentBind}"
                          title="${component.title.text}">` 
                    : ` </tac-checkbox>
                      </tf-field>`);
                }
                break;
              case 'Dropdown':
                template.push(start 
                  ? `
                  <tac-dropdown     
                      ${controlBind}
                      [component]="${componentBind}"
                      title="${component.title.text}">` 
                  : `
                  </tac-dropdown>`);
                break;
              case 'Chosen':
                template.push(start 
                  ? `           
                  <tac-chosen          
                    ${controlBind}                  
                    [component]="${componentBind}"
                    title="${component.title.text}">
                    <ng-template 
                      #myItemTemplate
                      let-data>
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
                  ? `
                  <tac-data-grid
                    [component]="${componentBind}">
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
  
   
      return template.join('\n');
    }


  createComponentByIndex(options: CreateComponentByIndex): any[] {
    const componentByIndex: any[] = [];
    let ignoredComponent: any = null;
    options
      .components
      .filter((component: any) => null !== component)
      .forEach((component: any) => {
        visit(component, (component: any, parent: any, index: Number, start: Boolean) => {
          // Ignore a component when it is rendered in an other view (aside or titlebar-commands)
          if (!!ignoredComponent) {
            if (!start && ignoredComponent === component) {
              ignoredComponent = null;
            }
            return;
          }
          if (!!options.isIgnoredComponent && options.isIgnoredComponent(component)) {
            ignoredComponent = component;
            return;
          }
          if (start) {
            componentByIndex.push(component);
          }
        });
      });
    return componentByIndex;
  }

}


interface CreateTemplate {
  components: any[];
  isIgnoredComponent?: (component: any) => boolean;
  cellEditor?: boolean;
  cellRenderer?: boolean;
}

interface CreateComponentByIndex extends CreateTemplate {
}

interface CreateAndCompileTemplate extends CreateTemplate {
  container: ViewContainerRef;
}