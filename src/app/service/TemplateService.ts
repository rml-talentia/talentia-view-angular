import { AfterViewInit, Compiler, Component, ComponentFactory, ElementRef, Injectable, Injector, NgModule, ViewChild } from "@angular/core";
import { Observable, ReplaySubject, Subject } from 'rxjs';
import * as crypto from 'crypto';
import { TacModule } from "../tac/tac.module";
import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { ICellEditorParams } from "@ag-grid-community/core";
import { IAfterGuiAttachedParams } from "ag-grid-community";
 


@Injectable()
export class TemplateService {

  COMPONENT_FACTORY_OBSERVABLES: {[key: string]: Subject<ComponentFactory<any>>} = {};

  EDITOR_FACTORY_OBSERVABLES: {[key: string]: Subject<any>} = {};

  constructor(
    private compiler: Compiler,
    private injector: Injector) {}

  getComponentFactory(template: string): Observable<ComponentFactory<any>> {
    console.log('template:', template);
    const templateKey = crypto
      .createHash('md5')
      .update(template)
      .digest('hex');
    let subject = this.COMPONENT_FACTORY_OBSERVABLES[templateKey];
    if (!!subject) {
      return subject;
    }
    this.COMPONENT_FACTORY_OBSERVABLES[templateKey] = subject = new ReplaySubject<ComponentFactory<any>>(1);
    const component = Component({
      selector: `generated-component-${templateKey}`,
      template: template
    })(class AnonymousComponent{});
    const module = NgModule({
      id: `generated-module-${templateKey}`,
      declarations: [
        component
      ],
      imports: [ 
        TacModule
      ]
    })(class AnonymousModule {});
    this
      .compiler
      .compileModuleAsync(module)
      .then(moduleFactory => {
        const 
          moduleRef = moduleFactory.create(this.injector),
          componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(component);
        subject.next(componentFactory);
        subject.complete();
      });  
    return subject;
  }
  
  getEditorFactory(template: string): Observable<any> {
    console.log('template:', template);
    const templateKey = crypto
      .createHash('md5')
      .update(template)
      .digest('hex');
    let subject = this.EDITOR_FACTORY_OBSERVABLES[templateKey];
    if (!!subject) {
      return subject;
    }
    this.EDITOR_FACTORY_OBSERVABLES[templateKey] = subject = new ReplaySubject<any>(1);
    const component = Component({
      selector: `generated-component-${templateKey}`,
      template: template
    })(class AnonymousComponent implements AfterViewInit, ICellEditorAngularComp {
      
      private params!: ICellEditorParams;
      parent!: any;
      message: string = 'HELLO IN ANTI PATTERN WORLD';
      cellEditor: ICellEditorAngularComp | null = null;
      

      constructor() {
        this.parent = this;       
      }

      ngAfterViewInit(): void {
      }

      agInit(params: ICellEditorParams): void {
        console.log('agInit this.cellEditor:' , this.cellEditor);
        this.params = params; 
        // if (!this.cellEditor) {
        //   return;
        // }
        // this.cellEditor.agInit(this.params);
      }

      afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        console.log('afterGuiAttached this.cellEditor:' , this.cellEditor);
        if (!this.cellEditor) {
          return;
        }
        this.cellEditor.agInit(this.params);
        if (this.cellEditor.afterGuiAttached) {
          this.cellEditor.afterGuiAttached(params);
        }
      }    

      getValue() {
        return !this.cellEditor ? this.params.value : this.cellEditor.getValue();
      }

   
    });
    const module = NgModule({
      id: `generated-module-${templateKey}`,
      declarations: [
        component
      ],
      imports: [ 
        TacModule
      ]
    })(class AnonymousModule {});
    this
      .compiler
      .compileModuleAsync(module)
      .then(moduleFactory => {
        const 
          moduleRef = moduleFactory.create(this.injector),
          componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(component);
        subject.next({
          componentFactory,
          Component,
          component});
        subject.complete();
      });  
    return subject;
  }

}



