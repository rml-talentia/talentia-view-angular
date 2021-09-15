import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TFEvent } from '@talentia/components';
import { FormService } from 'src/app/service/FormService';

@Component({
  selector: 'tac-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent implements OnInit {

  @Input()
  formName!: string;
  @Input()
  component!: any;

  constructor(
    private formService: FormService
  ) { }

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
    console.log('submit:', {
      form: this.formName,
      button: {
        data: this.component
      }
    });
   // this.form.markAllAsTouched();

    this.formService.submit({
      form: this.formName,
      button: {
        data: this.component
      }
    });
  }

}
