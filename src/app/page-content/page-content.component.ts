import { ChangeDetectorRef, Component } from '@angular/core';
import { TemplateService } from '../service/TemplateService';
import { IgnoredComponentOptions, ViewContainerComponent } from '../view-container/view-container.component';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.css']
})
export class PageContentComponent extends ViewContainerComponent {



  isIgnoredComponent(options: IgnoredComponentOptions): boolean {
    //console.log('[PageContentComponent] isIgnoredComponent....', component)
    switch(options.component.componentType) {
      //case 'Layout':
      case 'CommandsPanel':
      case 'AsidePanel':
        return true;
      default:
        if (!!options.component.parent) {
          switch (options.component.parent.componentType) {
            case 'EditableLayout':
              //console.log('[PageContentComponent] isIgnoredComponent editableLayout:', options.component);
              //return true;
          }
        }
        return false;
    }
  }
}

