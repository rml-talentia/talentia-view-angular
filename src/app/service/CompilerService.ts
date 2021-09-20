import { Compiler, Component, ComponentFactory, ElementRef, Injectable, Injector, NgModule } from "@angular/core";
import { Observable, ReplaySubject, Subject } from 'rxjs';
import * as crypto from 'crypto';
import { TacModule } from "../tac/tac.module";
 



@Injectable()
export class CompilerService {

  COMPONENT_FACTORY_OBSERVABLES: {[key: string]: Subject<ComponentFactory<any>>} = {};
  EDITOR_FACTORY_OBSERVABLES: {[key: string]: Subject<ComponentFactory<any>[]>} = {};

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
  
  getColumnFactories(options: GetColumnFactories): Observable<ComponentFactory<any>[]> {

    // templateKey is the sum of each template and column field name.
    const hash = crypto
      .createHash('md5');
    options
      .columns
      .forEach(column => hash
        .update(column.data.field || '') // TODO : CGCCG -> Détails.
        .update(column.template));
    const templateKey = hash
      .digest('hex');

    // When templates are already compiled, return componentFactories.
    let subject = this.EDITOR_FACTORY_OBSERVABLES[templateKey];
    if (!!subject) {
      return subject;
    }
    this.EDITOR_FACTORY_OBSERVABLES[templateKey] = subject = new ReplaySubject<ComponentFactory<any>[]>(1);

    // Compile components.
    const components = options
      .columns
      .map(column => Component({
        selector: `generated-cell-editor-${templateKey}`,
        template: column.template
      })(class AnonymousCellEditorComponent {}));
    const module = NgModule({
      id: `generated-data-grid-module-${templateKey}`,
      declarations: components,
      imports: [ 
        TacModule
      ]
    })(class AnonymousModule {});
    this
      .compiler
      .compileModuleAsync(module)
      .then(moduleFactory => {
        const 
          moduleRef = moduleFactory.create(this.injector);
        subject.next(components
          .map(component => moduleRef.componentFactoryResolver.resolveComponentFactory(component)));
        subject.complete();
      });  
    return subject;
  }

}

interface Column {
  data: any,
  template: string
}

interface GetColumnFactories {
  columns: Column[];
}