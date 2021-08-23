import { Component, OnInit } from '@angular/core';
import { ViewComponent, ViewService } from '../view/view.component';

@Component({
  selector: 'app-commands-panel',
  templateUrl: './commands-panel.component.html',
  styleUrls: ['./commands-panel.component.css'],
  providers: [
    ViewService
  ]
})
export class CommandsPanelComponent extends ViewComponent {
}

