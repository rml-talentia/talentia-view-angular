import { Component } from "@angular/core";
import { ViewContainerComponent, ViewService } from "../view-container/view-container.component";


@Component({
  selector: 'app-aside-panel',
  templateUrl: './aside-panel.component.html',
  styleUrls: ['./aside-panel.component.css'],
  providers: [
    ViewService
  ]
})
export class AsidePanelComponent extends ViewContainerComponent {
}

