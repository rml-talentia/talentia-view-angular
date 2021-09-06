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
  data!: any;

  constructor(
    private formService: FormService
  ) { }

  ngOnInit(): void {
  }

  get name() {
    return this.data.action.name;
  }

  get icon() {
    return this.data.action.icon;
  }

  get text() {
    return !this.data.action.title ? '' : this.data.action.title.text;
  }

  onSelected(event: TFEvent) {
    console.log('submit:', {
      form: this.formName,
      button: {
        name: this.name,
        text: this.text
      }
    });
   // this.form.markAllAsTouched();

    this.formService.submit({
      form: this.formName,
      button: {
        name: this.name,
        text: this.text
      }
    });
  }

}
