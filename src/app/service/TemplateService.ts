import { Compiler, Component, ComponentFactory, ComponentRef, Injectable, Injector, NgModule, ViewContainerRef } from "@angular/core";
import { Observable, concat, of, interval, timer } from 'rxjs';
import { map, concatAll, concatMap, take, toArray } from 'rxjs/operators';
import * as crypto from 'crypto';
import { TacModule } from "../tac/tac.module";


const COMPONENT_FACTORIES: {[key: string]: ComponentFactory<any>} = {};

export interface TemplateConfig {

    container: ViewContainerRef;
    template: string;
    data: any;
}

export class View {

    view: any;

    constructor(view: any) {
        this.view = view;
    }

    createTemplate(): string {
        let template: string[] = [];



        return template.join('\n');
    }
}


// export class CommandsPanelView extends View {


//     createTemplate(view: any): string {
//         const panel = findByComponentName(view, 'CommandsPanel');
//         return super.createTemplate({ data: !panel ? [] : [panel] });
//     }
// }

// export class AsidePanelView extends View {

//     createTemplate(view: any): string {
//         const panel = findByComponentName(view, 'AsidePanel');
//         return super.createTemplate({ data: !panel ? [] : [panel] });
//     }
// }


@Injectable()
export class TemplateService {

    constructor(
        private compiler: Compiler,
        private injector: Injector) {}


    createComponents(configurations: TemplateConfig[]): void {
        this
            .createComponentFactories(configurations.map(configuration => configuration.template))
            .pipe(map((componentFactories: ComponentFactory<any>[]) => {
                for (let i = 0; i < configurations.length; i++) {
                   //configurations[i].container.createComponent(componentFactories[i]);
                }
            }));

    }

    createComponentFactories(templates: string[]): Observable<ComponentFactory<any>[]> {
        return concat(... templates
            .map(template => this.createComponentFactory(template)))
            .pipe(toArray());
    }

    createComponentFactory(template: string): Observable<ComponentFactory<any>> {
        return new Observable<ComponentFactory<any>>(
          subscriber => {
            const 
              templateKey = crypto
                .createHash('md5')
                .update(template)
                .digest('hex'),
              componentFactory = COMPONENT_FACTORIES[templateKey];
            if (!!componentFactory) {
              subscriber.next(componentFactory);
              subscriber.complete();
              return;
            }
            const component = Component({
              selector: `generated-component-${templateKey}`,
              template: template
            })(class AnonymousComponent {});
            const module = NgModule({
              id: `generated-module-${templateKey}`,
              declarations: [
                component
              ],
              imports: [ 
                TacModule
              ],
              schemas: []
            })(class AnonymousModule {});
            this
              .compiler
              .compileModuleAsync(module)
              .then(moduleFactory => {
                const 
                  moduleRef = moduleFactory.create(this.injector),
                  componentFactory = moduleRef.componentFactoryResolver.resolveComponentFactory(component);
                COMPONENT_FACTORIES[templateKey] = componentFactory;
                subscriber.next(componentFactory);
                subscriber.complete();
              });        
          });
      }
}





function findByComponentName(view: any, componentName: string): any {
    return findInView(view, 
      (component: any, parent: any, index: Number, start: Boolean) => componentName === component.componentName ? component : undefined);
  }
  
  function findInView(view: any, finder: Function) {
    let value;
    visitView(view, (component: any, parent: any, index: Number, start: Boolean) => {
      return undefined === (value = finder(component, parent, index, start));
    });
    return value;
  }
  
  function visitView(view: any, visitor: Function) {
    const components = view
      .data
      .filter((component: any) => null !== component);
    for (let i = 0; i < components.length; i++) {
      let component = components[i];
      if (false === visit(component, visitor, null, i)) {
        return;
      }
    }
  }
  
  function visit(component: any, visitor: Function, parent?: any, index?: Number) {
    if (false === visitor(component, 
      'object' === typeof parent ? parent : null, 
      'number' === typeof index ? index : 0,
      true)) {
      return false;
    }
    for (let i = 0; i < component.components.length; i++) {
      if (false === visit(component.components[i], visitor, parent, index)) {
        return false;
      }
    }
    if (false === visitor(component, 
      'object' === typeof parent ? parent : null, 
      'number' === typeof index ? index : 0,
      false)) {
        return false;
      }
      return true;
  }