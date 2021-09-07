import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
  ComponentRef,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from '../service/AppService';
import { visit } from '../tac/util';
import { TemplateService } from '../service/TemplateService';
import { TransactionService } from '../service/TransactionService';
import { ViewService } from '../service/ViewService';
import { DataService } from '../service/DataService';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'app-view-container',
  templateUrl: './view-container.component.html',
  styleUrls: ['./view-container.component.css']
})
export class ViewContainerComponent implements OnDestroy, AfterViewInit, OnChanges  {



  @Input()
  view: any = null;
  @ViewChild('iframe', { read: ElementRef })
  iframe!: ElementRef<any>;
  @ViewChild('iframeWrapper', { read: ElementRef })
  iframeWrapper!: ElementRef<any>;

  @ViewChild(
    'container',
    {read: ViewContainerRef, static: false}
  ) container!: ViewContainerRef;
  componentRef!: ComponentRef<any>;
 
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    private transactionService: TransactionService,
    private appService: AppService,
    private templateService: TemplateService,
    private viewService: ViewService,
    private dataService: DataService) {}

  ngAfterViewInit() {
    window.TalentiaViewBridge._viewComponent = this;
  }

  ngOnDestroy(): void {
      this.componentRef.destroy();
  }

  doAction(data: any): void {
    console.log('[VIEW] doAction(data:', data, ')');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (null === changes.view.currentValue) {
     // this.close();
    } 
  }

  open(view: any): Observable<any> {

    if (!!this.componentRef) {
      this.componentRef.destroy();
    }

    this.view = view;

    const context = this.viewService.open({
      name: view.name,
      components: view.components
    });
    
    return this.viewService
      .createAndCompileTemplate({
        container: this.container,
        components: [this.view],
        isIgnoredComponent: this.isIgnoredComponent.bind(this)
      })
      .pipe(tap((componentRef: ComponentRef<any>) => this.componentRef = componentRef));
  }


  createComponentByIndex(): any[] {
    const componentByIndex: any[] = [];
    let ignoredComponent: any = null;
    this
      .view
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
          if (this.isIgnoredComponent(component)) {
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

  isIgnoredComponent(component: any): boolean {
    return false;
  }

  createContentTemplate(): string {
    return !this.view 
      ? '' 
      : this.createTemplate(this.view.components.filter((component: any) => null !== component));
  }
  
  createTemplate(components: any[]): string {
    const template: string[] = [];

    let componentIndex = -1;
    let formIndex = -1;

    let ignoredComponent: any = null;
    let formGroupBind: string | null = null;
    let formBind: string | null = null;

    template.push(`<tac-view>`);

    components
      .forEach((component: any) => {
        visit(component, (component: any, parent: any, index: Number, start: Boolean) => {

          // Ignore a component when it is rendered in an other view (aside or titlebar-commands)
          if (!!ignoredComponent) {
            if (!start && ignoredComponent === component) {
              ignoredComponent = null;
            }
            return;
          }
          if (this.isIgnoredComponent(component)) {
            ignoredComponent = component;
            return;
          }

          if (start) {
            componentIndex++;
          }

          // [(ngModel)]="${formBind}.data.${component.name}"

          const required = !!parent && 'Field' === parent.componentName && parent.required;
          const componentBind = `componentByIndex[${componentIndex}]`;
          const formControlBind = !formGroupBind || !component.name ? '' : `                
            #inputbase
            #formControl="ngModel"
            [form]="${formGroupBind}"
            name="${component.name}"
            [(ngModel)]="${!component.value ? '' : 'data.' + this.dataService.toExpression(component.value)}"
            ${required ? 'required' : ''}
          `.split(/ *\n */).join(' ');


          switch (component.componentName) {
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
                    [data]="${componentBind}"
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



