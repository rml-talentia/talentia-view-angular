import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ChangeDetectorRef,
  ComponentRef,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Injectable,
  ElementRef
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppService } from '../service/AppService';
import { visit } from '../tac/util';
import { TemplateService } from '../service/TemplateService';
import { FormService } from '../service/FormService';


@Injectable()
export class ViewService {

  private view: any;

  postConstruct(view: any) {
    this.view = view;
  }

  get contextPath(): string {
    return this.view.contextPath;
  }

  get sessionId(): string {
    return this.view.transaction.currentSessionId;
  }

  get csrfTokenName(): string {
    return this.view.transaction.csrfTokenName;
  }

  get csrfTokenValue(): string {
    return this.view.transaction.csrfTokenValue; 
  }

}



@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  providers: [
    ViewService
  ]
})
export class ViewComponent  implements OnDestroy, AfterViewInit, OnChanges  {

  @ViewChild(
    'container',
    {read: ViewContainerRef, static: false}
  ) container!: ViewContainerRef;

  @Input()
  view: any = null;
  @ViewChild('iframe', { read: ElementRef })
  iframe!: ElementRef<any>;
  @ViewChild('iframeWrapper', { read: ElementRef })
  iframeWrapper!: ElementRef<any>;

  formGroup!: FormGroup;  
  forms: Array<FormGroup> = [];

  formByIndex: Array<any> = [];
  componentByIndex: Array<any> = [];

  componentRef!: ComponentRef<any>;
 
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    private viewService: ViewService,
    private appService: AppService,
    private templateService: TemplateService) {}

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


  submit(): void {
    this.appService.submit();
  }

  open(view: any): Observable<any> {

    this.viewService.postConstruct(this.view = view);

    if (!!this.componentRef) {
      this.componentRef.destroy();
    }

    this.formByIndex = [];

    const opening = this
      .templateService
      .getComponentFactory(this.createContentTemplate());
    const subscription = opening
      .subscribe(componentFactory => {
        this.componentRef = this.container.createComponent(componentFactory);
        this.componentRef.instance.componentByIndex = this.componentByIndex = this.createComponentByIndex();
        this.componentRef.instance.forms = this.forms = this.createForms();
        this.componentRef.instance.submit = this.submit.bind(this);
        this.componentRef.changeDetectorRef.detectChanges();
        //this.componentRef.injector.get(ChangeDetectorRef).reattach();
      });


    
    return opening;
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

    let ignoredComponent: any = null;
    let form: any = null;

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
          const componentBind = `componentByIndex[${componentIndex}]`;
          switch (component.componentName) {
            case 'Transaction':
              template.push(start ? `
                <input 
                  type="hidden" 
                  name="sessionId" 
                  formControlName="sessionId" />
                <input 
                  type="hidden" 
                  name="_currentSessionId" 
                  formControlName="_currentSessionId" />
                <input 
                  type="hidden" 
                  name="_currentTransaction" 
                  formControlName="_currentTransaction" />
                <input 
                  type="hidden" 
                  name="_currentOption" 
                  formControlName="_currentOption" />
                <input 
                  type="hidden" 
                  name="_currentPath" 
                  formControlName="_currentPath" />
                <input 
                  type="hidden" 
                  [formControlName]="${componentBind}.csrfTokenName" />` : ``);
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
                      <tac-form [data]="{errors:[]}" [formGroup]="forms[0]">
                ` : `
                      </tac-form>
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
              // template.push(start ? `
              //   <form class="form" method="POST" action="${component.action}" onsubmit="TalentiaViewBridge.submit(event);"><i>Form</i>` : '</form>');
                this.formByIndex.push(component);
                template.push(start 
                  ? `<tac-form
                      [data]="${componentBind}"
                      [formGroup]="forms[0]"
                      #form="ngForm">` : '</tac-form>');
              break;
            case 'Button':
              //template.push(start ? `<button type="submit" class="button" name="${component.action.name}" value="${component.action.name}"><i class="${component.action.icon}"></i>${component.action.name}</button>` : ``);
              if (!!component.action.icon) {
                // tf-flat-button mode="light" 

                template.push(start 
                  ? `<tf-flat-button
                      mode="light" 
                      name="${component.action.name}"
                      icon="${component.action.icon}" 
                      text="" 
                      size="md" 
                      margin="sm"
                      (selected)="submit()">` : `</tf-flat-button>`);
                break;
              }
             
              template.push(start 
                ? `<tf-button 
                    addClasses="tf-width-full"
                    [block]="true"
                    name="${component.action.name}"
                    icon="${component.action.icon}" 
                    text="${!component.action.title ? '' : component.action.title.text}" 
                    size="sm" 
                    margin="sm"
                    (selected)="form.doSubmit()">` : `</tf-button>`);
              break;
            case 'Hidden':
                template.push(start 
                  ? `<input 
                      type="hidden" 
                      name="${component.name}" 
                      value="${!!component.value ? component.value.value : ''}" 
                      formControlName="${component.name}" />` : ``);
                break;
            case 'Text':
              // template.push(start ?
              //   (!!component.title.text ? `<label>${component.title.text}</label>` : ``) 
              //   + `<input class="text" type="text" name="${component.name}"  />` : ``);
              const required = !!parent && 'Field' === parent.componentName && parent.required;
              // formControlName="${component.name}"
              template.push(start 
                ? `<tf-input 
                    #inputbase
                    class="text" 
                    typeinput="text" 
                    [disabled]="!${componentBind}.access"
                    name="${component.name}"
                    formControlName="${component.name}"
                    >` : `</tf-input>`);
              break;
            case 'Checkbox':
              // template.push(start ? 
              //   (!!component.title.text ? `<label>${component.title.text}</label>` : ``) 
              //   + `<input class="text" type="checkbox" name="${component.name}"  />` : ``);
              // size="lg"
              template.push(start 
                ? `<tf-field cols="2">
                    <tf-checkbox 
                      [toggle]="true"
                      title="${component.title.text}"
                      formControlName="${component.name}">` 
                : ` </tf-checkbox>
                  </tf-field>`);
              break;
            case 'Dropdown':
              template.push(start 
                ? `<tac-dropdown     
                    [data]="${componentBind}"
                    title="${component.title.text}"
                    formControlName="${component.name}">` 
                : `</tac-dropdown>`);
              break;
            case 'Chosen':
              template.push(start 
                ? `           
                <tac-chosen     
                  [data]="${componentBind}"
                  [value]="${componentBind}.selection"
                  title="${component.title.text}"
                  formControlName="${component.name}">
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
                ? `<tac-data-grid [data]="${componentBind}">` 
                : `</tac-data-grid>`);
              break;
          }
        });
    });
    return template.join('\n');
  }


  
  createForms(): FormGroup[] {
    const forms: FormGroup[] = [];
    this
      .view
      .components
      .filter((component: any) => null !== component)
      .forEach((component: any) => {
        visit(component, (component: any, parent: any, index: Number, start: Boolean) => {
          switch (component.componentName) {
            case 'Form':
              const controls: { [key: string]: AbstractControl; } = {};

              /*
                <input type="hidden" name="dateDebut" value="" />
                <input type="hidden" name="dateFin" value="" />
                  <input type="hidden" name="org.apache.struts.taglib.html.CANCEL" value="org.apache.struts.taglib.html.CANCEL" />
              */
              controls['validate'] = new FormControl('Valider');

              // controls['dateDebut'] = new FormControl('');
              // controls['dateFin'] = new FormControl('');
              // controls['typeExercice'] = new FormControl('');
              // controls['selectionName'] = new FormControl('com.lswe.exploitation.moteur.selectionSansTri.selectValeurActiveSaveList');
              // controls['beanName'] = new FormControl('');
              // controls['fkCodeFonction'] = new FormControl('CGCCG');


              controls['explicitInjectionID'] = new FormControl('');
              controls['beanName'] = new FormControl('com.lswe.generale.gene.pieceComptableTravail');
              controls['fkCodeFonction'] = new FormControl('CGSEA');

              component
                .components
                .forEach((component: any) => {
                  visit(component, (component: any, parent: any, index: Number, start: Boolean) => {
                    const required = !!parent && 'Field' === parent.componentName && parent.required;
                    const validators: ValidatorFn[] = required ? [Validators.required] : [];
                    switch (component.componentName) {
                      case 'Transaction':
                        /*
                          <input type="hidden" name="sessionId" value="${component.currentSessionId}" />
                          <input type="hidden" name="_currentSessionId" value="${component.currentSessionId}" />
                          <input type="hidden" name="_currentTransaction" value="${component.currentTransaction}" />
                          <input type="hidden" name="_currentOption" value="${component.currentOption}" />
                          <input type="hidden" name="_currentPath" value="${component.currentPath}" />
                          <input type="hidden" name="${component.csrfTokenName}" value="${component.csrfTokenValue}" />
                        */
                        controls['sessionId'] = new FormControl(component.currentSessionId);
                        controls['_currentSessionId'] = new FormControl(component.currentSessionId);
                        controls['_currentTransaction'] = new FormControl(component.currentTransaction);
                        controls['_currentOption'] = new FormControl(component.currentOption);
                        controls['_currentPath'] = new FormControl(component.currentPath);
                        controls[component.csrfTokenName] = new FormControl(component.csrfTokenValue);
                        break;
                      case 'Hidden':
                      case 'Text':
                      case 'Dropdown':
                      case 'Chosen': 
                        // if ('compteDebut' === component.name) {
                        //   controls[component.name] = new FormControl('101300', validators);
                        //   break;
                        // }
                        // if ('compteFin' === component.name) {
                        //   controls[component.name] = new FormControl('999999', validators);
                        //   break;
                        // }
                        controls[component.name] = new FormControl(null !== component.value ? component.value.value : '', { validators: validators });
                        break;
                      case 'Checkbox':
                        controls[component.name] = new FormControl(null !== component.value ? component.value.value : false, { validators: validators });
                        break;
                    }
                  });
                });
              forms.push(new FormGroup(controls));
              return false;
            default:
              return true;
          }
        });
      });

      console.log('forms:', forms);

      if (!!forms.length) {
        return forms;
      }

      const controls: { [key: string]: AbstractControl; } = {};
      this
        .view
        .components
        .filter((component: any) => null !== component)
        .forEach((component: any) => {
          visit(component, (component: any, parent: any, index: Number, start: Boolean) => {
            switch (component.componentName) {
              case 'Transaction':
                /*
                  <input type="hidden" name="sessionId" value="${component.currentSessionId}" />
                  <input type="hidden" name="_currentSessionId" value="${component.currentSessionId}" />
                  <input type="hidden" name="_currentTransaction" value="${component.currentTransaction}" />
                  <input type="hidden" name="_currentOption" value="${component.currentOption}" />
                  <input type="hidden" name="_currentPath" value="${component.currentPath}" />
                  <input type="hidden" name="${component.csrfTokenName}" value="${component.csrfTokenValue}" />
                */
                controls['sessionId'] = new FormControl(component.currentSessionId);
                controls['_currentSessionId'] = new FormControl(component.currentSessionId);
                controls['_currentTransaction'] = new FormControl(component.currentTransaction);
                controls['_currentOption'] = new FormControl(component.currentOption);
                controls['_currentPath'] = new FormControl(component.currentPath);
                controls[component.csrfTokenName] = new FormControl(component.csrfTokenValue);
                break;
              case 'Hidden':
              case 'Text':
                if ('compteDebut' === component.name) {
                  controls[component.name] = new FormControl('101300');
                  break;
                }
                if ('compteFin' === component.name) {
                  controls[component.name] = new FormControl('999999');
                  break;
                }
                controls[component.name] = new FormControl(null !== component.value ? component.value.value : '');
                break;
              case 'Checkbox':
                controls[component.name] = new FormControl(null !== component.value ? component.value.value : false);
                break;
            }
          });
        });
      forms.push(new FormGroup(controls));

      return forms;
  }

}



