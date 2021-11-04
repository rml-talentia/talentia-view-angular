import { Directive, Input, ViewContainerRef } from "@angular/core";
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";

@Directive({
    selector: '[tacConstraints]',
    providers: [{provide: NG_VALIDATORS, useExisting: TacConstraintsDirective, multi: true}]
  })
export class TacConstraintsDirective implements Validator {

    @Input('component')
    private component: any;

    constructor(private viewContainerRef: ViewContainerRef)
    {

    }
    

    validate(control: AbstractControl): ValidationErrors | null {
        //console.log('[Constraints] component: ', this.component);
        const violations = this.component.violations;
        if (null === violations || !violations.length) {
            return null;
        }
        const errors: ValidationErrors = {};
        violations.forEach((violation: any, index: number) => {
            errors['tfCustomValidator'] = [violation.text];
        });
        console.log('[TacConstraintsDirective] errors:', errors);
        return errors;
    }
}