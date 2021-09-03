import { Component, OnInit } from '@angular/core';
import { ViewContainerComponent, ViewService } from '../view-container/view-container.component';

@Component({
  selector: 'app-commands-panel',
  templateUrl: './commands-panel.component.html',
  styleUrls: ['./commands-panel.component.css'],
  providers: [
    ViewService
  ]
})
export class CommandsPanelComponent extends ViewContainerComponent {
}

