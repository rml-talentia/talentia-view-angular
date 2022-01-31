import { Component } from '@angular/core';
import { ViewContainerComponent } from '../view-container/view-container.component';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.css']
})
export class PageContentComponent extends ViewContainerComponent {

  isIgnoredComponent(component: any): boolean {
    switch(component.componentType) {
      case 'Layout':
      case 'CommandsPanel':
      case 'AsidePanel':
        return true;
      default:
        return false;
    }
  }
}

