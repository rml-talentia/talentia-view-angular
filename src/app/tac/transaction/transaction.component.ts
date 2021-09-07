import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DataService } from 'src/app/service/DataService';
import { FormService } from 'src/app/service/FormService';

@Component({
  selector: 'tac-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit, OnDestroy {

  /**
   * Utility component.
   * It is not intented to really manage anything about the transaction.
   * As quirk workaround, because of form template driven pattern we use it as child of form to register formGroup.
   * It is used to register form data too.
   */
  @Input()
  form!: FormGroup;
  @Input()
  formData!: any;


  constructor(
    private formService: FormService,
    private dataService: DataService
  ) { }


  ngOnInit(): void {
    this.dataService.register(this.formData);
    this.formService.register({
      data: this.formData,
      group: this.form
    });
  }

  ngOnDestroy(): void {
    this.dataService.unregister(this.formData);  
    this.formService.unregister({
      data: this.formData,
      group: this.form
    });
  }

}
