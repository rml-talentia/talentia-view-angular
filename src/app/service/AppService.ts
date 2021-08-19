import { Injectable } from "@angular/core";
import { AppComponent } from "../app.component";

@Injectable()
export class AppService {

    private appComponent!: AppComponent;

    initialize(appComponent: any) {
        this.appComponent = appComponent;
    }

    openLegacy(path: string): void {
      this.open({
        legacy: {
          src: path
        }
      });
    }

    open(view: any): void {
        this.appComponent.openView(view);
        // console.log('[APP] openView(', view, ')');
        // const 
        //   iframe = this.appComponent.pageContent.iframe.nativeElement;
        // if (!!view.legacy) {
          
        //   setTimeout(() => {
        //     this.appComponent.asidePanel.open({ data: [] });
        //     setTimeout(() => {
        //         this.appComponent.commandsPanel.open({ data: [] });
        //     });
        //   });
        //   iframe.src = view.legacy.src;
        //   return;
        // }
        
        // this.appComponent.hideLegacyView();
        // this.appComponent.navigationHistory = this.appComponent.createNavigationHistory(view);
        // this.appComponent.pageContent.open(view);
        
        // const commandsPanel = findByComponentName(view, 'CommandsPanel');
        // this.appComponent.commandsPanel.open({ data: !commandsPanel ? [] : [commandsPanel] });
        // const asidePanel = findByComponentName(view, 'AsidePanel');
        // this.appComponent.asidePanel.open( { data: !asidePanel ? [] : [asidePanel] });
    }

    submit(): void {

      this.appComponent.pageLoading = true;

      const action = this.appComponent.pageContent.formByIndex[0].action;
      const formGroup = this.appComponent.pageContent.forms[0];

      const data: { [field: string]: any; } = {};
      for (let field in formGroup.value) {
        let value = formGroup.value[field];
        if ('boolean' === typeof value) {
          value = value ? 'on' : 'off';
        }
        data[field] = value;
      }  
      
      console.log('data:', data);
      window.TalentiaViewBridge.submitObject(action, data);
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