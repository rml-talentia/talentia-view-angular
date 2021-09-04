import { Component } from "@angular/core";
import { ViewContainerComponent } from "../view-container/view-container.component";


@Component({
  selector: 'app-aside-panel',
  templateUrl: './aside-panel.component.html',
  styleUrls: ['./aside-panel.component.css']
})
export class AsidePanelComponent extends ViewContainerComponent {
}

