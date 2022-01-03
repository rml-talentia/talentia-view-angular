import { AfterContentChecked, AfterContentInit, Directive, Input } from '@angular/core';

@Directive({
  selector: '[tacItem]'
})
export class ItemDirective implements AfterContentInit {

  @Input('tacItem')
  item!: string;

  constructor() { }

  ngAfterContentInit(): void {
    console.log('item:', this.item);
  }

}
