import { Component } from '@angular/core';
import { DataService } from '../service/DataService';
import { ViewComponent, ViewService } from '../view/view.component';

@Component({
  selector: 'app-page-content',
  templateUrl: './page-content.component.html',
  styleUrls: ['./page-content.component.css'],
  providers: [
    ViewService,
    DataService
  ]
})
export class PageContentComponent extends ViewComponent {

  isIgnoredComponent(component: any): boolean {
    switch(component.componentName) {
      case 'CommandsPanel':
      case 'AsidePanel':
        return true;
      default:
        return false;
    }
  }
}

