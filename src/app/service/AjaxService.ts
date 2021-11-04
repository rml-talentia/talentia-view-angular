import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { findByComponentType, getRoot } from "../tac/util";
import { MutationService } from "./MutationService";
import { ReferenceService } from "./ReferenceService";
import { TransactionService } from "./TransactionService";
import { Action, Component, Reference } from "./types";


type AjaxRequest = {
    ajax: any,
    refreshes: Reference[]
}

@Injectable()
export class AjaxService {

    constructor(
        private http: HttpClient,
        private referenceService: ReferenceService,
        private mutationService: MutationService,
        private transactionService: TransactionService) {
    }

    doTableChange(component: Component, action: Component) {

        const dataGrid: Component | null = action.getClosest('DataGrid');
        const control: Component | null | undefined = action.parent?.parent;


        console.log('action:', action);

        const payload: any = {
            model: dataGrid?.model.toObject(),
            behavior: action.toObject()
        };

        console.log('payload:', payload);

        this
            .http
            .post(
                `${this.transactionService.contextPath}/services/private/api/dataGrid/CGSEETableDataGridModel/do${action.componentType.replace(/^Table/, '')}?sessionId=${this.transactionService.sessionId}`,
                payload, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                    }
                })
                .subscribe({
                    next: (response: any) => {
                        console.log('response:' , response);
                        response
                            .mutations
                            .forEach((mutation: any) => {
                                this.mutationService.apply(component, mutation);
                            });
                    }
                });
    }

    doAjax(component: Component, action: Component) {
        console.log('[AjaxService] component:', component, ' action:', action);

        const session = findByComponentType(getRoot(component), 'SessionComponent');
        const contextData = findByComponentType(getRoot(component), 'ContextDataComponent');
        console.log('session: ', session);
        console.log('contextData: ', contextData);

        console.log('action:', action);
        console.log('action:', action.toObject());
        
   


        
        const payload: AjaxRequest = {
            ajax: action.toObject(),
            refreshes: (<Reference[]> [])
                .concat(Object.keys(session.data).map(key => ({ referenceType: 'SessionReference', key: key, parent: null })))
                .concat(Object.keys(contextData.data).map(key => ({ referenceType: 'ContextDataReference', key: key, parent: null })))
        };
        console.log('payload:', payload);


        this
            .http
            .post(
                `${this.transactionService.contextPath}/services/private/api/view/bridge/ajax?sessionId=${this.transactionService.sessionId}`,
                payload, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                    }
                })
                .subscribe({
                    next: (response: any) => {
                        console.log('response:' , response);
                        response
                            .mutations
                            .forEach((mutation: any) => {
                                this.mutationService.apply(component, mutation);
                            });
                    }
                });
    }

    _doAjax(component: Component, action: Action) {
        console.log('[AjaxService] component:', component, ' action:', action);

        const sessionComponent = findByComponentType(getRoot(component), 'SessionComponent');
        const contextDataComponent = findByComponentType(getRoot(component), 'ContextDataComponent');
        console.log('session: ', sessionComponent);
        console.log('contextData: ', contextDataComponent);





        const payload = new URLSearchParams();
        payload.set(this.transactionService.csrfTokenName, this.transactionService.csrfTokenValue);
        action
          .parameters
          .forEach((parameter: any) => {
            payload.set(
              this.referenceService.getValue(component, parameter.bindings.references.name), 
              this.referenceService.getValueOrDefault(component, parameter.bindings.references.value, ''));
          });
          this
            .http
            .post(
                `${this.transactionService.contextPath}/viewbridge/ajax/${action.href}?sessionId=${this.transactionService.sessionId}`,
                payload.toString(), 
                {
                    headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    [this.transactionService.csrfTokenName]: this.transactionService.csrfTokenValue
                    }
                })
                .subscribe({
                    next: (response: any) => {
                        console.log('response:' , response);
                        response
                        .mutations
                        .forEach((mutation: any) => {
                            this.mutationService.apply(component, mutation);
                        });
                    }
                });
    }
}