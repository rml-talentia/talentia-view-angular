
import { ComponentFactory, ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { visit } from "../tac/util";
import { CompilerService } from "./CompilerService";
import { TFGridColConfig } from "@talentia/components/lib/models/tf-grid-col-config.model";
import { Bindable } from "./types";
import { ReferenceService } from "./ReferenceService";




@Injectable()
export class TemplateService {    
 
  constructor(
    private compilerService: CompilerService) {}

  createAndCompileTemplate(options: CreateAndCompileTemplate): Observable<ComponentRef<any>> {
    const template = this.createTemplate(options);
    const componentByIndex = this.createComponentByIndex(options);
    return this
      .compilerService
      .getComponentFactory(template)
      .pipe(map((componentFactory: ComponentFactory<any>) => {
        const componentRef = options.container.createComponent(componentFactory);
        componentRef.instance.componentByIndex = componentByIndex;
        //componentRef.instance.data = this.dataService.data;
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
  

    const doVisit = (component: any) => {
      visit(component, (component: any, parent: any, index: Number, start: Boolean) => {

        // Ignore a component when it is rendered in an other view (aside or titlebar-commands)
        if (!!ignoredComponent) {
          if (!start && ignoredComponent === component) {
            ignoredComponent = null;
          }
          return;
        }
        if (this.isIgnoredComponent(options, component)) {
          ignoredComponent = component;
          return;
        }

        if (start) {
          componentIndex++;
        }

        const required = !!parent && 'Field' === parent.componentType && parent.required;
        const componentBind = `componentByIndex[${componentIndex}]`;
        const formControlBind = !formGroupBind || !component.name ? '' : `
          #inputbase
          [(ngModel)]="${componentBind}.value"
          name="${component.name}"
          [form]="${formGroupBind}"
          #formControl="ngModel"
          tacConstraints
        `;  

//              ${!required ? '' : 'required'}
      //     tacConstraints

        // [(ngModel)]="${!component.value ? '' : 'data.' + this.dataService.toExpression(component.value)}"
        // [(ngModel)]="${componentBind}.value"

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


          //console.log('componentBind: ', componentBind,  ' component:', component);

        if (!!options.cellRenderer) { 
          switch(component.componentType) {
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

        switch (component.componentType) {
          case 'Content':
            break;
          case 'Layout':
            break;
          case 'EditableLayout':
            template.push(start ? `
              <tac-editable-layout
                [component]="${componentBind}">` : `</tac-editable-layout>`);
            break;
          case 'InsertableComponent':

            template.push(start ? `
              <ng-template
                #${component.components[0].id}_template>
              ` : `
              </ng-template>`);


              // template.push(start ? `
              // <ng-template
              //   #${component.components[0].id}_template>
              //   <tf-grid-layout>
              //     <tf-field cols="12" title="&nbsp;">

              // ` : `
              //     </tf-field>
              //   </tf-grid-layout>
              // </ng-template>`);

            break;
          case 'Insertion':
            //
            if (start) {



              if (null !== component.insertion) {
                //console.log('[TemplateService] insertion: ', component);
                doVisit(component.insertion);
              }
            }
            break;
          case 'ViewEditor':
            template.push(start ? `
            <tac-view-editor>
            ` : `
            </tac-view-editor>`);
            break;
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
                    [component]="${formBind}"
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
              <br/>
              `);
              break;
            }
            template.push(start ? `
            <tf-panel 
              cols="12" 
              text="${component.title ? component.title.text : ''}">
            ` : `
            </tf-panel>
            <br/>
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
            //const title = component.components[0].title;
            //console.log('[TemplateService] field:', component);
            let title;
            switch (component.components[0].componentType) {
              case 'Insertion':

                if (null ===  component.components[0].insertion) {
                  return;
                }

                title = component.components[0].insertion.title;
                break;
              default:
                title = component.components[0].title;
            }


            
            template.push(start ? `
            <tf-field 
              addClasses="${!!title.text && !!title.text.trim() ? 'tf-bold' : ''}"
              title="${!!title.text && !!title.text.trim() ? title.text : '&nbsp;'}" 
              [cols]="${!!component.size ? `{default:${component.size.medium},sm:${component.size.small},md:${component.size.medium},lg:${component.size.medium},xl:${component.size.large}}` : 4}">
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
          case 'Input':
            template.push(start
              ? `
              <tac-input
                ${controlBind}
                [component]="${componentBind}">                
              ` : `
              </tac-input>
              `);
            break;
          case 'ExtendedInput':
            const itemTemplates = component
              .components
              .map((child: Bindable) => `
              <ng-template let-item>
                <div 
                  style="
                    display: grid;
                    grid-gap: .5em;
                    grid-template-columns: ${child.columns.map((column: any) => Math.ceil(column.size * 100) + '%').join(' ')};">
              ` + child
                .columns
                .map((column: any, len: number, index: number) => `
                <div 
                *ngIf="!item"
                style="
                  background: #adb5bd;
                  opacity: .25;
                  border-radius: 3px;
                  grid-column: ${index + 1};
                  text-align: left;"
                >&nbsp;</div>
              <div
                *ngIf="item"
                style="
                  grid-column: ${index + 1};
                  text-align: left;
                  white-space: normal;
                  ${!column.value ? '' : 'font-weight: bold;'}"
                ><span>{{item.data.${column.field}}}</span></div>`).join('\n') + `
                </div>
              </ng-template>`);

            template.push(start
              ? `
              <tac-input
                ${controlBind}
                [component]="${componentBind}">
                <tac-dropdown>
                  <tac-list
                    [component]="${componentBind}.dropdown">
                    ${itemTemplates}
                  </tac-list>
                </tac-dropdown>
              </tac-input>             
              <tac-model-switch 
                extra
                [component]="${componentBind}"></tac-model-switch>   
              ` : ``);
            break;
          case 'Chosen':
                        //  flex: ${Math.ceil(column.size * 100) / 100};
            if (null !== component.model.columns) {
              const itemTemplates2 = [component.model]
                .map((child: Bindable) => `
                  <ng-template let-item>
                    <div 
                      style="
                        display: grid;
                        grid-gap: .5em;
                        grid-template-columns: ${child.columns.map((column: any) => Math.ceil(column.size * 100) + '%').join(' ')};">
                  ` + child
                  .columns
                  .map((column: any, index: number) => `
                      <div 
                        *ngIf="!item"
                        style="
                          background: #adb5bd;
                          opacity: .25;
                          border-radius: 3px;
                          grid-column: ${index + 1};
                          text-align: left;"
                        >&nbsp;</div>
                      <div
                        *ngIf="item"
                        style="
                          grid-column: ${index + 1};
                          text-align: left;
                          white-space: normal;
                          ${!column.value ? '' : 'font-weight: bold;'}"
                        ><span>{{item.data.${column.field}}}</span></div>`).join('\n') + `
                    </div>
                  </ng-template>`);

              template.push(start
                ? `
                <tac-input
                  ${controlBind}
                  [component]="${componentBind}">
                  <tac-dropdown>
                    <tac-list
                      [component]="${componentBind}.model">
                      ${itemTemplates2}
                    </tac-list>
                  </tac-dropdown>
                </tac-input>
                ` : ``);
            } else {
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
            }
            break;
          case 'Dropdown':
            template.push(start 
              ? `
              <tac-select     
                  ${controlBind}
                  [component]="${componentBind}"
                  title="${component.title.text}">` 
              : `
              </tac-select>`);
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
          case 'Radio':
            template.push(start 
              ? `
              <tac-radio     
                  ${controlBind}
                  [component]="${componentBind}"
                  title="${component.title.text}">` 
              : `
              </tac-radio>`);
            break;

          case 'DataGrid':
            console.log('dataGrid:', component);
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
    };
    
    options
      .components
      .forEach((component: any) => {
        doVisit(component);
    });

  
    return template.join('\n');
  }


  createComponentByIndex(options: CreateComponentByIndex): any[] {
    const componentByIndex: any[] = [];
    let ignoredComponent: any = null;


    const doVisit = (component: any) => {
      visit(component, (component: any, parent: any, index: Number, start: Boolean) => {
        // Ignore a component when it is rendered in an other view (aside or titlebar-commands)
        if (!!ignoredComponent) {
          if (!start && ignoredComponent === component) {
            ignoredComponent = null;
          }
          return;
        }
        if (this.isIgnoredComponent(options, component)) {
          ignoredComponent = component;
          return;
        }
        if (start) {          
          switch (component.componentType) {
            case 'Insertion':
              componentByIndex.push(component);
              if (null !== component.insertion) {
                doVisit(component.insertion);
              }
              break;
            default:
              componentByIndex.push(component);
          }
        }
      });
    };

    options
      .components
      .filter((component: any) => null !== component)
      .forEach((component: any) => {
        doVisit(component);
      });
    return componentByIndex;
  }


  private isIgnoredComponent(options: CreateTemplate, component: Bindable) {
    return !!options.isIgnoredComponent 
      && options.isIgnoredComponent({ component: component, viewEditor: !!options.viewEditor }) 
      || component.componentType === 'DataGridColumn';
  }

}


interface CreateTemplate {
  components: any[];
  isIgnoredComponent?: (component: any) => boolean;
  cellEditor?: boolean;
  cellRenderer?: boolean;

  viewEditor?: boolean;
}

interface CreateComponentByIndex extends CreateTemplate {
}

interface CreateAndCompileTemplate extends CreateTemplate {
  container: ViewContainerRef;
}