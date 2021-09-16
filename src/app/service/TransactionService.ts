import { Injectable } from "@angular/core";


export interface WritableTransactionService {

    setView(view: any): void;
}


/**
 * Share view's transaction infos through other services and components.
 */
@Injectable()
export class TransactionService implements WritableTransactionService {
   
    private view: any;
   
    setView(view: any): void {
        this.view = view;
    }

    get contextPath(): string {
      return this.view.contextPath;
    }

    get sessionId(): string {
       return this.view.transaction.currentSessionId;
    }

    get csrfTokenName(): string {
      return this.view.transaction.csrfTokenName;
    }

    get csrfTokenValue(): string {
       return this.view.transaction.csrfTokenValue; 
    }
    
    
}