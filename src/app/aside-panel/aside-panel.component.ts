import { Component } from "@angular/core";
import { ViewComponent, ViewService } from "../view/view.component";


@Component({
  selector: 'app-aside-panel',
  templateUrl: './aside-panel.component.html',
  styleUrls: ['./aside-panel.component.css'],
  providers: [
    ViewService
  ]
})
export class AsidePanelComponent extends ViewComponent {
}

