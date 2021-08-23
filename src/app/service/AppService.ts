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

