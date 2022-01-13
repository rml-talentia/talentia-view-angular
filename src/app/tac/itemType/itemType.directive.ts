import { AfterContentChecked, AfterContentInit, Directive, ElementRef, Input, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';

@Directive({
  selector: '[itemType]'
})
export class ItemTypeDirective implements AfterContentInit {

  @Input()
  itemType!: string;

  @ViewChildren(TemplateRef)
  templateRefs!: QueryList<TemplateRef<any>>;

  constructor(public templateRef: TemplateRef<any>) { }

  ngAfterContentInit(): void {
    console.log('itemType:', this.itemType);
  }

  // get templateRef(): TemplateRef<any> {
  //   const templateRef = this.templateRefs.get(0);
  //   if (!templateRef) {
  //     throw new Error();
  //   }
  //   return templateRef;
  // }

}
