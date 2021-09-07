import { Compiler, Component, ComponentFactory, ElementRef, Injectable, Injector, NgModule } from "@angular/core";
import { Observable, ReplaySubject, Subject } from 'rxjs';
import * as crypto from 'crypto';
import { TacModule } from "../tac/tac.module";
import { CellEditorBaseComponent } from "../tac/base/cell-editor-base.component";
 
interface WritableCellEditorContext {

  setParent(parent: any): void;
}

@Injectable()
export class CellEditorContext implements WritableCellEditorContext {

  private parent: any;

  constructor() {
  }

  setParent(parent: any): void {
    this.parent = parent;
  }

}


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
      selector: `generated-cell-editor-${templateKey}`,
      template: template
    })(class AnonymousCellEditorComponent extends CellEditorBaseComponent {});
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



