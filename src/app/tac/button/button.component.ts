import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TFEvent } from '@talentia/components';
import { ActionService } from 'src/app/service/ActionService';
import { BaseComponent } from '../base/component-base.component';

@Component({
  selector: 'tac-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent extends BaseComponent implements OnInit {

  @Input()
  formName!: string;

  constructor(
    private actionService: ActionService) {
    super();
  }

  ngOnInit(): void {
  }

  get name() {
    return this.component.action.name;
  }

  get icon() {
    return this.component.action.icon;
  }

  get text() {
    return !this.component.action.title ? '' : this.component.action.title.text;
  }

  onSelected(event: TFEvent) {
    console.log('[Button] onSelected(event:', event, ') component:', this.component);
    this.actionService.submit(this.component.action);
  }

}
