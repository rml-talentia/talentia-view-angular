import { Injectable } from "@angular/core";
import { ReferenceService } from "./ReferenceService";


type Mutation = {
    mutationType: string;
    [key: string]: any;
}


@Injectable()
export class MutationService {

    constructor(private referenceService: ReferenceService) {}

    // TODO : put all type in same file , Component, Mutation, Reference, etc...
    apply(component: any, mutation: Mutation) {
        switch (mutation.mutationType) {
            case 'Set':
                this.referenceService.setValue(component, mutation.to, mutation.value);
                break;
            case 'Add':
                this.referenceService.addValue(component, mutation.to, mutation.value);
                break;
            case 'Splice':
                this.referenceService.spliceValue(component, mutation.to, mutation.start, mutation.count, mutation.elements);
                break;
            default:
                console.error('[MutationService] mutation: ', mutation);
                throw new Error('Unsupported operation.');
        }
    }

}