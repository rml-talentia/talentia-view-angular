import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TFMessageService, TFMessageType } from '@talentia/components';
import { DataService } from 'src/app/service/DataService';

@Component({
  selector: 'tac-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionComponent implements OnInit, OnDestroy, AfterViewInit {

  /**
   * 
   * Utility component.
   * It is not intented to really manage anything about the transaction.
   * As quirk workaround, because of form template driven pattern we use it as child of form to register formGroup.
   * It is used to register form data too.
   */
  @Input()
  form!: FormGroup;
  @Input()
  component!: any; // It is the form component.
  data: any; // It is the form data.
  name!: string; // It is the form name. 

  constructor(
    private messageService: TFMessageService,
    private dataService: DataService
  ) { }


  ngOnInit(): void {

    // Register form to data service like any other components.
    this.name = this.component.name;
    this.data = Object.assign({}, this.component.data); // Clone form data to keep original values.
    this.dataService.register(this);
  }

  ngOnDestroy(): void {
    this.dataService.unregister(this.component);  
  }

  ngAfterViewInit(): void {
    // Render server side validation errors.
    this.component.errors.forEach((error: any) => {
      this.messageService.alert(error.text, TFMessageType.error);
    });
  }


}
