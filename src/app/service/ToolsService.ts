import { Injectable } from "@angular/core";
import { AppService } from "./AppService";
import { ReferenceService } from "./ReferenceService";
import { Component, Reference } from "./types";





/**
 * Allow tools like an uibuilder or a test engine to query components.
 * 
 */
@Injectable()
export class ToolsService {

    constructor(
        private appService: AppService,
        private referenceService: ReferenceService) {
        // Because it is used by e2e test engine, 
        // this service can be called outside of the angular application.
        window.ToolsService = this;
    }

    getBounds(reference: Reference) {
        const element = this.getElement(reference);
        return null === element ? null : element.getBoundingClientRect();
    }

    /**
     * 
     * @param reference view api reference targeting components themself (example: ControlReference, RowByIndexReference, etc...) 
     * @returns component dom element or null if it not exists
     */
    getElement(reference: Reference): HTMLElement | null {
        const value = this.getValue(reference);
       
        return null;
    }

    getValue(reference: Reference) {
        const root = this.getRoot();
        if (null === root) {
            return null;
        }
        return this.referenceService.getValue(root, reference);
    }

    /**
     * 
     * @returns the root component 
     */
    getRoot(): Component | null {
       // throw new Error('Not implemented yet.');
       return this.appService.getView();
    }


}